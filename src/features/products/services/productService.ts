/**
 * Product Service — Wires up the Clean Architecture layers.
 * This is the "composition root" for product operations in the web app.
 *
 * Image resolution: legacy DB rows still reference `/images/<jar-mock>.jpg`
 * placeholders. We translate those to real Instagram photos at the
 * presentation boundary so the catalog never shows the mocks.
 */

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

  async getFeaturedProducts() {
    const useCase = new GetFeaturedProductsUseCase(createProductRepo());
    try {
      return withResolvedImages(await useCase.execute(6));
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
