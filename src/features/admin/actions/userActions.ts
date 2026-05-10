"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/infrastructure/auth/admin-guard";
import { updateUserRole } from "@/features/admin/services/adminUserService";

export async function updateUserRoleAction(
  userId: string,
  formData: FormData
) {
  await requireAdmin();

  const role = formData.get("role") as string;
  if (role !== "admin" && role !== "customer") {
    return { error: "Rol inválido" };
  }

  const result = await updateUserRole(userId, role);
  if (!result.ok) {
    return { error: result.error ?? "Error al actualizar rol" };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}
