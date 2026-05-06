import "server-only";

import { ADMIN_AVAILABLE, createSupabaseAdminClient } from "@/infrastructure/supabase/admin";

const SIGNED_URL_TTL = 60 * 30;

function admin() {
  if (!ADMIN_AVAILABLE) throw new Error("ADMIN_DISABLED");
  return createSupabaseAdminClient();
}

export type AdminVoucherRow = {
  id: string;
  order_id: string;
  storage_path: string;
  is_verified: boolean;
  confidence: number | null;
  warnings: string[];
  extracted: Record<string, unknown>;
  created_at: string;
  order_total: number;
  payment_status: string;
  customer_phone: string;
  zone: string;
};

export async function listPendingVouchers(): Promise<AdminVoucherRow[]> {
  try {
    const supabase = admin();
    const { data, error } = await supabase
      .from("payment_vouchers")
      .select(
        `id, order_id, storage_path, is_verified, confidence, warnings, extracted, created_at,
         orders:order_id (total, payment_status, phone, zone)`,
      )
      .order("created_at", { ascending: false });
    if (error) throw error;

    type Row = {
      id: string;
      order_id: string;
      storage_path: string;
      is_verified: boolean;
      confidence: number | null;
      warnings: string[] | null;
      extracted: Record<string, unknown> | null;
      created_at: string;
      orders: {
        total: number;
        payment_status: string;
        phone: string;
        zone: string;
      } | null;
    };
    const rows = (data ?? []) as unknown as Row[];

    return rows
      .filter((r) => !!r.orders)
      .map((r) => ({
        id: r.id,
        order_id: r.order_id,
        storage_path: r.storage_path,
        is_verified: r.is_verified,
        confidence: r.confidence,
        warnings: r.warnings ?? [],
        extracted: r.extracted ?? {},
        created_at: r.created_at,
        order_total: Number(r.orders!.total),
        payment_status: r.orders!.payment_status,
        customer_phone: r.orders!.phone,
        zone: r.orders!.zone,
      }));
  } catch (e) {
    console.warn("[adminPaymentService.listPendingVouchers]", e);
    return [];
  }
}

export async function getSignedVoucherUrl(storagePath: string): Promise<string | null> {
  try {
    const supabase = admin();
    const { data, error } = await supabase.storage
      .from("vouchers")
      .createSignedUrl(storagePath, SIGNED_URL_TTL);
    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export async function verifyVoucher(voucherId: string, orderId: string) {
  const supabase = admin();
  const [{ error: vErr }, { error: oErr }] = await Promise.all([
    supabase
      .from("payment_vouchers")
      .update({ is_verified: true })
      .eq("id", voucherId),
    supabase
      .from("orders")
      .update({ payment_status: "verified" })
      .eq("id", orderId),
  ]);
  if (vErr) throw new Error(vErr.message);
  if (oErr) throw new Error(oErr.message);
}

export async function rejectVoucher(voucherId: string, orderId: string, reason?: string) {
  const supabase = admin();
  const note = reason?.trim() ? [reason.trim()] : ["rechazado_por_admin"];
  const [{ error: vErr }, { error: oErr }] = await Promise.all([
    supabase
      .from("payment_vouchers")
      .update({ is_verified: false, warnings: note })
      .eq("id", voucherId),
    supabase
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", orderId),
  ]);
  if (vErr) throw new Error(vErr.message);
  if (oErr) throw new Error(oErr.message);
}

export async function markCashPaid(orderId: string) {
  const supabase = admin();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "paid" })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
}
