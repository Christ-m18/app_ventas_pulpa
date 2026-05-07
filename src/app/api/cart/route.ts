import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { createSupabaseAdminClient, isAdminAvailable } from "@/infrastructure/supabase/admin";

export const runtime = "nodejs";

const cartSyncSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.uuid(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .max(100),
});

// GET — return the current user's cart_items rows.
export async function GET() {
  try {
    if (!isAdminAvailable()) return NextResponse.json({ items: [] });

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) return NextResponse.json({ items: [] });

    const { data, error } = await supabase
      .from("cart_items")
      .select("product_id, quantity")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ items: [] });
    }
    return NextResponse.json({ items: data ?? [] });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

// PUT — replace the current user's cart with the given items (idempotent sync).
export async function PUT(req: Request) {
  try {
    if (!isAdminAvailable()) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta" },
        { status: 503 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const parsed = cartSyncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Items inválidos", issues: z.flattenError(parsed.error) },
        { status: 422 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const admin = createSupabaseAdminClient();
    const { error: delErr } = await admin.from("cart_items").delete().eq("user_id", user.id);

    // If the table doesn't exist, return 503 so the client stops retrying.
    if (delErr) {
      console.warn("[api/cart PUT] delete error:", delErr.message);
      return NextResponse.json(
        { error: "Cart sync no disponible" },
        { status: 503 },
      );
    }

    if (parsed.data.items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const { error: insertErr } = await admin
      .from("cart_items")
      .insert(
        parsed.data.items.map((it) => ({
          user_id: user.id,
          product_id: it.product_id,
          quantity: it.quantity,
        })),
      );

    if (insertErr) {
      console.warn("[api/cart PUT] insert error:", insertErr.message);
      return NextResponse.json(
        { error: "Cart sync no disponible" },
        { status: 503 },
      );
    }

    return NextResponse.json({ items: parsed.data.items });
  } catch (err) {
    console.error("[api/cart PUT] unexpected:", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 503 },
    );
  }
}
