"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/infrastructure/auth/admin-guard";
import { OrderStatusEnum } from "../../../../packages/core/domain/entities/order";
import { updateOrderStatus } from "../services/adminOrderService";

const Schema = z.object({
  orderId: z.string().uuid(),
  status: OrderStatusEnum,
});

export async function updateOrderStatusAction(input: { orderId: string; status: string }) {
  await requireAdmin();
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos" };
  try {
    await updateOrderStatus(parsed.data.orderId, parsed.data.status);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    revalidatePath("/admin/deliveries");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al actualizar" };
  }
}
