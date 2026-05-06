import { NextResponse } from "next/server";
import { z } from "zod";
import { DELIVERY_ZONES } from "@/../packages/core/domain/entities/order";
import { checkoutPayloadSchema } from "@/features/checkout/schemas";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { createSupabaseAdminClient, ADMIN_AVAILABLE } from "@/infrastructure/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const parsed = checkoutPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", issues: z.flattenError(parsed.error) },
        { status: 422 },
      );
    }
    const payload = parsed.data;

    // 1. Resolve zone server-side. Never trust shipping cost from the client.
    const zone = DELIVERY_ZONES.find((z) => z.id === payload.zone);
    if (!zone) {
      return NextResponse.json({ error: "Zona desconocida" }, { status: 422 });
    }

    // 2. Identify user (optional — guests allowed).
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    // 3. Pull authoritative product prices from DB.
    const productIds = payload.items.map((i) => i.product_id);
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price, stock")
      .in("id", productIds);

    if (prodErr || !products || products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Algunos productos no están disponibles" },
        { status: 409 },
      );
    }

    // 4. Validate stock + recompute totals server-side.
    const priceMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    for (const line of payload.items) {
      const p = priceMap.get(line.product_id);
      if (!p) {
        return NextResponse.json({ error: `Producto ${line.product_id} no existe` }, { status: 409 });
      }
      if (p.stock < line.quantity) {
        return NextResponse.json(
          { error: `Sin stock suficiente para ${p.name}` },
          { status: 409 },
        );
      }
      subtotal += Number(p.price) * line.quantity;
    }
    const shipping = zone.cost;
    const total = subtotal + shipping;

    // 5. Create the order with the correct initial payment_status.
    const isCash = payload.paymentMethod === "cash_on_delivery";
    const initialPaymentStatus = isCash ? "pending_cash" : "awaiting_voucher";

    if (!ADMIN_AVAILABLE) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta (SERVICE_ROLE_KEY)" },
        { status: 503 },
      );
    }

    const admin = createSupabaseAdminClient();
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        total,
        status: "pending",
        payment_method: payload.paymentMethod,
        payment_status: initialPaymentStatus,
        delivery_address: payload.address,
        zone: payload.zone,
        shipping_cost: shipping,
        phone: payload.phone,
        notes: payload.notes ?? null,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      console.warn("[api/checkout] order insert error:", orderErr?.message);
      return NextResponse.json({ error: "No se pudo crear la orden" }, { status: 503 });
    }

    // 6. Items insert with the prices we computed (not what client sent).
    const { error: itemsErr } = await admin.from("order_items").insert(
      payload.items.map((line) => {
        const p = priceMap.get(line.product_id)!;
        return {
          order_id: order.id,
          product_id: line.product_id,
          quantity: line.quantity,
          price: Number(p.price),
        };
      }),
    );

    if (itemsErr) {
      // Rollback order if items insertion failed.
      await admin.from("orders").delete().eq("id", order.id);
      console.warn("[api/checkout] items insert error:", itemsErr.message);
      return NextResponse.json({ error: "No se pudo registrar los productos" }, { status: 503 });
    }

    // 7. Clear authenticated user's cart (best-effort, ignore errors).
    if (user) {
      await admin.from("cart_items").delete().eq("user_id", user.id);
    }

    return NextResponse.json({
      id: order.id,
      total,
      payment_status: initialPaymentStatus,
      requires_voucher: !isCash,
    });
  } catch (err) {
    console.error("[api/checkout] unexpected:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

