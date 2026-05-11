import "server-only";

import { createSupabaseAdminClient, isAdminAvailable } from '@/infrastructure/supabase/admin';
import { withResolvedImages } from '../utils/productImage';
import { createProductRepo } from './productService';
import {
  GetFeaturedProductsUseCase,
} from '../../../../packages/core/use-cases/product.use-cases';
import type { ProductWithCategory } from '../../../../packages/core/domain/entities/product';

/**
 * Returns featured products combining:
 * 1. Manually featured (is_featured = true) — always shown first
 * 2. Top purchased products (by total quantity sold) — fill remaining slots
 *
 * This module uses "server-only" because it requires the admin client.
 * Only import from Server Components or API routes.
 */
export async function getFeaturedProductsWithPopularity(limit = 6) {
  try {
    // 1. Get manually featured products
    const useCase = new GetFeaturedProductsUseCase(createProductRepo());
    const manualFeatured = await useCase.execute(limit);

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
        const salesMap = new Map<string, number>();
        for (const item of topProducts) {
          const pid = item.product_id as string;
          salesMap.set(pid, (salesMap.get(pid) ?? 0) + (item.quantity as number));
        }

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

    return withResolvedImages(manualFeatured);
  } catch (e) {
    console.error('Error fetching featured products:', e);
    return [];
  }
}
