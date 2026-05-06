/**
 * Product Repository Interface — The "port" in Clean Architecture.
 * Defines what operations are available WITHOUT dictating HOW they are implemented.
 * The infrastructure layer (Supabase) will provide the concrete implementation.
 */

import type { ProductWithCategory, Category } from '../entities/product';

export interface IProductRepository {
  /** Fetch all products with their categories. */
  getAll(): Promise<ProductWithCategory[]>;

  /** Fetch featured products with their categories. */
  getFeatured(limit?: number): Promise<ProductWithCategory[]>;

  /** Fetch a single product by ID with its category. */
  getById(id: string): Promise<ProductWithCategory | null>;

  /** Fetch all categories. */
  getCategories(): Promise<Category[]>;

  /** Search products by name or description. */
  search(query: string): Promise<ProductWithCategory[]>;
}
