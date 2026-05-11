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

export function createProductRepo() {
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

  async getFeaturedProducts(limit = 6) {
    const useCase = new GetFeaturedProductsUseCase(createProductRepo());
    try {
      return withResolvedImages(await useCase.execute(limit));
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
