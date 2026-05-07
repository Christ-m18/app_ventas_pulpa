import "server-only";

import { isAdminAvailable, createSupabaseAdminClient } from "@/infrastructure/supabase/admin";
import type { AdminInventoryLog, AdminProductRow } from "./types";

function admin() {
  if (!isAdminAvailable()) throw new Error("ADMIN_DISABLED");
  return createSupabaseAdminClient();
}

export type ProductInput = {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  unit: "lb" | "kg" | "paquete";
  image_url: string | null;
  category_id: string | null;
  is_combo: boolean;
  is_featured: boolean;
  benefits: string[];
};

export async function listProducts(): Promise<AdminProductRow[]> {
  try {
    const supabase = admin();
    const { data, error } = await supabase
      .from("products")
      .select(
        `id, name, description, price, stock, unit, image_url, category_id,
         is_combo, is_featured, benefits, updated_at,
         categories:categories (name)`,
      )
      .order("updated_at", { ascending: false });
    if (error) throw error;

    type Row = {
      id: string;
      name: string;
      description: string | null;
      price: number;
      stock: number;
      unit: AdminProductRow["unit"];
      image_url: string | null;
      category_id: string | null;
      is_combo: boolean;
      is_featured: boolean;
      benefits: string[] | null;
      updated_at: string;
      categories: { name: string } | null;
    };
    const rows = (data ?? []) as unknown as Row[];

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      price: Number(r.price),
      stock: r.stock,
      unit: r.unit,
      image_url: r.image_url,
      category_id: r.category_id,
      category_name: r.categories?.name ?? null,
      is_combo: r.is_combo,
      is_featured: r.is_featured,
      benefits: r.benefits ?? [],
      updated_at: r.updated_at,
    }));
  } catch (e) {
    console.warn("[adminProductService.listProducts]", e);
    return [];
  }
}

export async function getProduct(id: string): Promise<AdminProductRow | null> {
  try {
    const supabase = admin();
    const { data, error } = await supabase
      .from("products")
      .select(
        `id, name, description, price, stock, unit, image_url, category_id,
         is_combo, is_featured, benefits, updated_at,
         categories:categories (name)`,
      )
      .eq("id", id)
      .single();
    if (error || !data) return null;
    type Row = {
      id: string;
      name: string;
      description: string | null;
      price: number;
      stock: number;
      unit: AdminProductRow["unit"];
      image_url: string | null;
      category_id: string | null;
      is_combo: boolean;
      is_featured: boolean;
      benefits: string[] | null;
      updated_at: string;
      categories: { name: string } | null;
    };
    const r = data as unknown as Row;
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      price: Number(r.price),
      stock: r.stock,
      unit: r.unit,
      image_url: r.image_url,
      category_id: r.category_id,
      category_name: r.categories?.name ?? null,
      is_combo: r.is_combo,
      is_featured: r.is_featured,
      benefits: r.benefits ?? [],
      updated_at: r.updated_at,
    };
  } catch (e) {
    console.warn("[adminProductService.getProduct]", e);
    return null;
  }
}

export async function listCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
  try {
    const supabase = admin();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");
    if (error) throw error;
    return (data ?? []) as Array<{ id: string; name: string; slug: string }>;
  } catch (e) {
    console.warn("[adminProductService.listCategories]", e);
    return [];
  }
}

export async function createProduct(input: ProductInput): Promise<{ id: string }> {
  const supabase = admin();
  const { data, error } = await supabase.from("products").insert(input).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "No se pudo crear el producto");
  return { id: data.id as string };
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const supabase = admin();
  // If stock changes, log inventory adjustment.
  if (typeof input.stock === "number") {
    const { data: current } = await supabase
      .from("products")
      .select("stock")
      .eq("id", id)
      .single();
    const prev = (current?.stock as number | undefined) ?? 0;
    const delta = input.stock - prev;
    if (delta !== 0) {
      await supabase.from("inventory_logs").insert({
        product_id: id,
        change: delta,
        reason: delta > 0 ? "restock" : "correction",
        order_id: null,
      });
    }
  }

  const { error } = await supabase
    .from("products")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: string) {
  const supabase = admin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function toggleFeatured(id: string, value: boolean) {
  const supabase = admin();
  const { error } = await supabase
    .from("products")
    .update({ is_featured: value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listInventoryLogs(productId?: string): Promise<AdminInventoryLog[]> {
  try {
    const supabase = admin();
    let query = supabase
      .from("inventory_logs")
      .select(`id, product_id, change, reason, order_id, created_at, products:products (name)`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (productId) query = query.eq("product_id", productId);
    const { data, error } = await query;
    if (error) throw error;

    type Row = {
      id: string;
      product_id: string;
      change: number;
      reason: string;
      order_id: string | null;
      created_at: string;
      products: { name: string } | null;
    };
    const rows = (data ?? []) as unknown as Row[];
    return rows.map((r) => ({
      id: r.id,
      product_id: r.product_id,
      product_name: r.products?.name ?? null,
      change: r.change,
      reason: r.reason,
      order_id: r.order_id,
      created_at: r.created_at,
    }));
  } catch (e) {
    console.warn("[adminProductService.listInventoryLogs]", e);
    return [];
  }
}
