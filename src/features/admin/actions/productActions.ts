"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/infrastructure/auth/admin-guard";
import {
  createProduct,
  deleteProduct,
  toggleFeatured,
  updateProduct,
  type ProductInput,
} from "../services/adminProductService";

const ProductSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(120),
  description: z.string().max(2000).nullable(),
  price: z.number().positive("El precio debe ser mayor a 0"),
  stock: z.number().int().min(0, "Stock no puede ser negativo"),
  unit: z.enum(["lb", "kg", "gl", "paquete"]),
  image_url: z
    .string()
    .url()
    .nullable()
    .or(z.literal("").transform(() => null)),
  category_id: z
    .string()
    .uuid()
    .nullable()
    .or(z.literal("").transform(() => null)),
  is_combo: z.boolean(),
  is_featured: z.boolean(),
  benefits: z.array(z.string()).max(10),
});

function parseFormData(form: FormData): unknown {
  const benefitsRaw = (form.get("benefits") as string | null) ?? "";
  return {
    name: form.get("name")?.toString().trim() ?? "",
    description: (form.get("description")?.toString().trim() || null) as string | null,
    price: Number(form.get("price") ?? 0),
    stock: Number(form.get("stock") ?? 0),
    unit: (form.get("unit") as string) || "lb",
    image_url: (form.get("image_url")?.toString().trim() || null) as string | null,
    category_id: (form.get("category_id")?.toString().trim() || null) as string | null,
    is_combo: form.get("is_combo") === "on",
    is_featured: form.get("is_featured") === "on",
    benefits: benefitsRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export async function createProductAction(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = ProductSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  try {
    const { id } = await createProduct(parsed.data as ProductInput);
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/tienda");
    redirect(`/admin/products/${id}/edit`);
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "No se pudo crear",
    };
  }
}

export async function updateProductAction(
  productId: string,
  _prev: unknown,
  formData: FormData,
) {
  await requireAdmin();
  const parsed = ProductSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  try {
    await updateProduct(productId, parsed.data as ProductInput);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath("/");
    revalidatePath("/tienda");
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "No se pudo guardar",
    };
  }
}

export async function deleteProductAction(productId: string) {
  await requireAdmin();
  try {
    await deleteProduct(productId);
    revalidatePath("/admin/products");
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "No se pudo eliminar",
    };
  }
}

export async function toggleFeaturedAction(productId: string, value: boolean) {
  await requireAdmin();
  try {
    await toggleFeatured(productId, value);
    revalidatePath("/admin/products");
    revalidatePath("/");
    revalidatePath("/tienda");
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Error",
    };
  }
}
