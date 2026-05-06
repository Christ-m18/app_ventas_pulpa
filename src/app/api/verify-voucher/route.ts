import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createSupabaseAdminClient } from "@/infrastructure/supabase/admin";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const CONFIDENCE_AUTO_VERIFY = 0.85;

type Extracted = {
  is_voucher: boolean;
  amount: number | null;
  currency: string | null;
  date: string | null;
  reference_number: string | null;
  bank_emisor: string | null;
  beneficiary_name: string | null;
  beneficiary_account: string | null;
  sender_name: string | null;
  warnings: string[];
  confidence: number;
};

const FALLBACK: Extracted = {
  is_voucher: false,
  amount: null,
  currency: null,
  date: null,
  reference_number: null,
  bank_emisor: null,
  beneficiary_name: null,
  beneficiary_account: null,
  sender_name: null,
  warnings: ["No pudimos analizar la imagen automáticamente."],
  confidence: 0,
};

function extToMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
}

async function callGemini(base64: string, mime: string, expected: number): Promise<Extracted> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ...FALLBACK, warnings: ["Gemini no configurado."] };

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const systemPrompt = `Eres un verificador de comprobantes de transferencia bancaria de la República Dominicana.
Analiza la imagen adjunta. Devuelve EXCLUSIVAMENTE JSON con esta forma:
{
  "is_voucher": boolean,
  "amount": number | null,
  "currency": "DOP" | "USD" | null,
  "date": string | null,
  "reference_number": string | null,
  "bank_emisor": string | null,
  "beneficiary_name": string | null,
  "beneficiary_account": string | null,
  "sender_name": string | null,
  "warnings": string[],
  "confidence": number
}
Reglas:
- "is_voucher" = true solo si la imagen es claramente un comprobante de transferencia bancaria (no captura genérica, no factura, no recibo de POS).
- El monto esperado de esta transferencia es RD$${expected.toFixed(2)}. Si el monto extraído difiere por más de 1 peso, agrega un warning "monto_no_coincide".
- "confidence" en [0,1] basado en qué tan claros y verificables son los datos.
- Sin texto adicional fuera del JSON.`;

  try {
    const result = await model.generateContent([
      { text: systemPrompt },
      { inlineData: { data: base64, mimeType: mime } },
    ]);
    const text = result.response.text();
    
    // Función para limpiar el texto por si la IA responde con bloques de código markdown
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');
    }

    const parsed = JSON.parse(cleanText) as Partial<Extracted>;
    return { ...FALLBACK, ...parsed, warnings: parsed.warnings ?? [] };
  } catch (err) {
    console.error("[Voucher Verifier] Error en Gemini:", err);
    return {
      ...FALLBACK,
      warnings: [`Error de IA: ${err instanceof Error ? err.message : "desconocido"}`],
    };
  }
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Form data inválida" }, { status: 400 });

  const orderId = form.get("orderId");
  const file = form.get("voucher");

  if (typeof orderId !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type) && !ALLOWED_MIME.has(extToMime(file.name))) {
    return NextResponse.json({ error: "Solo aceptamos JPG, PNG o WEBP" }, { status: 415 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagen demasiado pesada (máximo 5MB)" }, { status: 413 });
  }

  const admin = createSupabaseAdminClient();

  // 1. Look up order to know expected amount + owner.
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, user_id, total, payment_method, payment_status")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }
  if (order.payment_method !== "bank_transfer") {
    return NextResponse.json({ error: "Esta orden no requiere comprobante" }, { status: 409 });
  }

  // 2. Persist file to private bucket.
  const arrayBuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  const ext = (file.type.split("/")[1] || "jpg").toLowerCase();
  const folder = order.user_id ?? "guest";
  const objectPath = `${folder}/${order.id}-${Date.now()}.${ext}`;

  const upload = await admin.storage
    .from("vouchers")
    .upload(objectPath, buffer, { contentType: file.type, upsert: false });

  if (upload.error) {
    return NextResponse.json(
      { error: `Subida falló: ${upload.error.message}` },
      { status: 500 },
    );
  }

  // 3. AI extraction (Gemini Vision).
  const base64 = buffer.toString("base64");
  const expected = Number(order.total);
  const extracted = await callGemini(base64, file.type, expected);

  // 4. Decide auto-verify vs review.
  const warnings = [...extracted.warnings];
  const amountOk =
    extracted.amount != null && Math.abs(extracted.amount - expected) <= 1;
  if (!amountOk) warnings.push("monto_no_coincide");
  if (!extracted.is_voucher) warnings.push("no_es_comprobante");

  const isVerified =
    extracted.is_voucher && amountOk && extracted.confidence >= CONFIDENCE_AUTO_VERIFY;
  const newPaymentStatus = isVerified ? "verified" : "pending_review";

  // 5. Insert voucher row + update order.
  const { data: voucher, error: voucherErr } = await admin
    .from("payment_vouchers")
    .insert({
      order_id: order.id,
      user_id: order.user_id,
      storage_path: objectPath,
      extracted: extracted as unknown as Record<string, unknown>,
      is_verified: isVerified,
      confidence: extracted.confidence,
      warnings,
    })
    .select("id")
    .single();

  if (voucherErr || !voucher) {
    return NextResponse.json(
      { error: `No se pudo registrar el comprobante: ${voucherErr?.message ?? "desconocido"}` },
      { status: 500 },
    );
  }

  await admin
    .from("orders")
    .update({ payment_status: newPaymentStatus })
    .eq("id", order.id);

  return NextResponse.json({
    voucher_id: voucher.id,
    payment_status: newPaymentStatus,
    is_verified: isVerified,
    confidence: extracted.confidence,
    warnings,
    extracted,
  });
}
