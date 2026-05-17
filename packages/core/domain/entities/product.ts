/**
 * Product Entity — Pure domain model.
 * Zero dependencies on UI frameworks or infrastructure (Supabase, etc).
 */

import { z } from 'zod';

// ─── Zod Schemas (Single Source of Truth) ──────────────────────

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
  slug: z.string().min(1),
  created_at: z.string().datetime({ offset: true }),
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'El nombre del producto es requerido'),
  description: z.string().nullable(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  unit: z.enum(['lb', 'kg', 'gl', 'paquete']),
  image_url: z.string().url().nullable(),
  category_id: z.string().uuid().nullable(),
  is_combo: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  benefits: z.array(z.string()).default([]),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export const ProductWithCategorySchema = ProductSchema.extend({
  categories: CategorySchema.nullable(),
});

// ─── TypeScript Types (Derived from Zod) ───────────────────────

export type Category = z.infer<typeof CategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductWithCategory = z.infer<typeof ProductWithCategorySchema>;

// ─── Domain Value Objects ──────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}
