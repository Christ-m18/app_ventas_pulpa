"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/infrastructure/auth/admin-guard";
import {
  markCashPaid,
  rejectVoucher,
  verifyVoucher,
} from "../services/adminPaymentService";

const VerifySchema = z.object({
  voucherId: z.string().uuid(),
  orderId: z.string().uuid(),
});

const RejectSchema = VerifySchema.extend({
  reason: z.string().max(200).optional(),
});

const CashSchema = z.object({ orderId: z.string().uuid() });

export async function verifyVoucherAction(input: { voucherId: string; orderId: string }) {
  await requireAdmin();
  const parsed = VerifySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };
  try {
    await verifyVoucher(parsed.data.voucherId, parsed.data.orderId);
    revalidatePath("/admin/payments");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function rejectVoucherAction(input: {
  voucherId: string;
  orderId: string;
  reason?: string;
}) {
  await requireAdmin();
  const parsed = RejectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };
  try {
    await rejectVoucher(parsed.data.voucherId, parsed.data.orderId, parsed.data.reason);
    revalidatePath("/admin/payments");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function markCashPaidAction(input: { orderId: string }) {
  await requireAdmin();
  const parsed = CashSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };
  try {
    await markCashPaid(parsed.data.orderId);
    revalidatePath("/admin/payments");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}
