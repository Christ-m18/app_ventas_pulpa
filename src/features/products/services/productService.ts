import { getSupabaseClient } from '../../../../packages/infrastructure/supabase/client';
import { SupabaseProductRepository } from '../../../../packages/infrastructure/supabase/product.repository';
import {
  GetProductsUseCase,
  GetFeaturedProductsUseCase,
  GetProductByIdUseCase,
  GetCategoriesUseCase,
  SearchProductsUseCase,
} from '../../../../packages/core/use-cases/product.use-cases';
import { withResolvedImage, withResolvedImages } from '../utils/productImage';
import { createSupabaseAdminClient, isAdminAvailable } from '@/infrastructure/supabase/admin';
import type { ProductWithCategory } from '../../../../packages/core/domain/entities/product';

function createProductRepo() {
  return new SupabaseProductRepository(getSupabaseClient());
}

export const productService = {
  async getProducts() {
    const useCase = new GetProductsUseCase(createProductRepo());
    try {
      return withResolvedImages(await useCase.execute());
    } catch (e) {
      console.error('Error fetching products:', e);
      return [];
    }
  },

  /**
   * Returns featured products combining:
   * 1. Manually featured (is_featured = true) — always shown first
   * 2. Top purchased products (by total quantity sold) — fill remaining slots
   */
  async getFeaturedProducts(limit = 6) {
    try {
      // 1. Get manually featured products
      const useCase = new GetFeaturedProductsUseCase(createProductRepo());
      const manualFeatured = await useCase.execute(limit);

      // If manual featured already fills the limit, return them
      if (manualFeatured.length >= limit) {
        return withResolvedImages(manualFeatured.slice(0, limit));
      }

      // 2. Get top purchased products to fill remaining slots
      const remaining = limit - manualFeatured.length;
      const manualIds = new Set(manualFeatured.map(p => p.id));

      if (isAdminAvailable()) {
        const admin = createSupabaseAdminClient();
        const { data: topProducts, error } = await admin
          .from('order_items')
          .select('product_id, quantity')
          .order('quantity', { ascending: false });

        if (!error && topProducts && topProducts.length > 0) {
          // Aggregate total quantity per product
          const salesMap = new Map<string, number>();
          for (const item of topProducts) {
            const pid = item.product_id as string;
            salesMap.set(pid, (salesMap.get(pid) ?? 0) + (item.quantity as number));
          }

          // Sort by total quantity descending, exclude already featured
          const topIds = Array.from(salesMap.entries())
            .filter(([id]) => !manualIds.has(id))
            .sort((a, b) => b[1] - a[1])
            .slice(0, remaining)
            .map(([id]) => id);

          if (topIds.length > 0) {
            const repo = createProductRepo();
            const topFeatured: ProductWithCategory[] = [];

            for (const id of topIds) {
              const product = await repo.getById(id);
              if (product) topFeatured.push(product);
            }

            return withResolvedImages([...manualFeatured, ...topFeatured]);
          }
        }
      }

      // Fallback: just return manual featured
      return withResolvedImages(manualFeatured);
    } catch (e) {
      console.error('Error fetching featured products:', e);
      return [];
    }
  },

  async getCategories() {
    const useCase = new GetCategoriesUseCase(createProductRepo());
    try {
      return await useCase.execute();
    } catch (e) {
      console.error('Error fetching categories:', e);
      return [];
    }
  },

  async getProductById(id: string) {
    const useCase = new GetProductByIdUseCase(createProductRepo());
    try {
      const product = await useCase.execute(id);
      return product ? withResolvedImage(product) : null;
    } catch (e) {
      console.error(`Error fetching product ${id}:`, e);
      return null;
    }
  },

  async searchProducts(query: string) {
    const useCase = new SearchProductsUseCase(createProductRepo());
    try {
      return withResolvedImages(await useCase.execute(query));
    } catch (e) {
      console.error('Error searching products:', e);
      return [];
    }
  },
};
