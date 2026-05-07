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
  
  const fallbackModels = [
    "gemini-2.5-flash",
    "gemini-3-flash",
    "gemini-3.1-flash-lite",
  ];

  const systemPrompt = `Eres un auditor financiero experto en la República Dominicana.
Tu tarea es analizar meticulosamente la imagen adjunta, que debe ser un comprobante de transferencia bancaria (voucher).

REGLAS ESTRICTAS:
1. "is_voucher" debe ser true ÚNICAMENTE si es un comprobante de transferencia válido y legible. Rechaza capturas de pantalla genéricas, fotos de tarjetas, o facturas que no sean transferencias.
2. Reconoce bancos dominicanos populares (Banco Popular, Banreservas, BHD, Scotiabank, APAP, Asociación Cibao, etc.).
3. "amount": Extrae el monto de la transferencia. IGNORA el símbolo de moneda (RD$, USD$) y las comas de miles. Devuelve un número entero o decimal limpio (ej. si dice "RD$ 1,500.00" devuelve 1500). Si no encuentras un monto claro, devuelve null.
4. "currency": Intenta identificar si es DOP o USD.
5. El monto esperado de esta transferencia es RD$${expected.toFixed(2)}. Si el monto que extraes difiere por más de 1 peso, agrega el warning "monto_no_coincide" en tu arreglo de warnings.
6. "confidence": Un número del 0.0 al 1.0 indicando qué tan seguro estás de tu análisis. Usa 0.9 o más si el comprobante es claro, legible y parece auténtico. Usa menos de 0.8 si está borroso, recortado o parece sospechoso.

Devuelve EXCLUSIVAMENTE un objeto JSON válido con esta estructura exacta:
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
}`;

  let lastError: unknown = null;
  const MAX_RETRIES = 2;
  const BASE_DELAY_MS = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let success = false;
    let extractedData: Partial<Extracted> | null = null;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          }
        });

        const result = await model.generateContent([
          { text: systemPrompt },
          { inlineData: { data: base64, mimeType: mime } },
        ]);
        const text = result.response.text();
        
        // Función para limpiar el texto por si la IA responde con bloques de código markdown
        let cleanText = text.trim();
        if (cleanText.startsWith('\`\`\`')) {
          cleanText = cleanText.replace(/^\`\`\`(?:json)?\n?/i, '').replace(/\n?\`\`\`$/i, '');
        }

        extractedData = JSON.parse(cleanText) as Partial<Extracted>;
        console.log(`[Voucher Verifier] Éxito usando ${modelName} en el intento ${attempt}`);
        success = true;
        
        return { ...FALLBACK, ...extractedData, warnings: extractedData.warnings ?? [] };
      } catch (err) {
        console.warn(`[Voucher Verifier] Falló ${modelName} (Intento ${attempt}):`, err instanceof Error ? err.message : err);
        lastError = err;
      }
    }

    if (success) break;
    
    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`[Voucher Verifier] Reintentando todos los modelos en ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error("[Voucher Verifier] Error definitivo en Gemini:", lastError);
  return {
    ...FALLBACK,
    warnings: [`Error de IA o Bloqueo Geográfico: ${lastError instanceof Error ? lastError.message : "desconocido"}`],
  };
}

export async function POST(req: Request) {
  console.log("[API] Iniciando POST /api/verify-voucher");
  const form = await req.formData().catch((e) => {
    console.error("[API] Error leyendo formData:", e);
    return null;
  });
  if (!form) return NextResponse.json({ error: "Form data inválida o cuerpo demasiado grande" }, { status: 400 });

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
  console.log(`[API] Buscando orden ${orderId}`);
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

  console.log(`[API] Subiendo archivo a storage: ${objectPath} (${file.size} bytes)`);
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
  console.log(`[API] Llamando a Gemini... (monto esperado: ${expected})`);
  const extracted = await callGemini(base64, file.type, expected);
  console.log("[API] Gemini respondió:", extracted);

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

  console.log("[API] Proceso finalizado con éxito");

  return NextResponse.json({
    voucher_id: voucher.id,
    payment_status: newPaymentStatus,
    is_verified: isVerified,
    confidence: extracted.confidence,
    warnings,
    extracted,
  });
}
