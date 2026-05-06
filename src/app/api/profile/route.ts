import { NextResponse } from "next/server";
import { z } from "zod";
import { profileUpdateSchema } from "@/features/profile/schemas";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: z.flattenError(parsed.error) },
      { status: 422 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const phone = parsed.data.phone?.trim() || null;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone,
    })
    .eq("id", user.id)
    .select("id, full_name, phone, role, mfa_required")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: `No se pudo actualizar el perfil: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ profile: data });
}
