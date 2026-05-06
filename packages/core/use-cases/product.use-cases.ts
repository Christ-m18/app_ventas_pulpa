/**
 * GetProducts Use Case — Application-level orchestration.
 * Depends only on the repository interface (port), never on Supabase directly.
 */

import type { IProductRepository } from '../domain/repositories/product.repository';
import type { ProductWithCategory, Category } from '../domain/entities/product';

export class GetProductsUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(): Promise<ProductWithCategory[]> {
    return this.productRepo.getAll();
  }
}

export class GetFeaturedProductsUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(limit = 6): Promise<ProductWithCategory[]> {
    return this.productRepo.getFeatured(limit);
  }
}

export class GetProductByIdUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(id: string): Promise<ProductWithCategory | null> {
    return this.productRepo.getById(id);
  }
}

export class GetCategoriesUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(): Promise<Category[]> {
    return this.productRepo.getCategories();
  }
}

export class SearchProductsUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(query: string): Promise<ProductWithCategory[]> {
    if (!query.trim()) return [];
    return this.productRepo.search(query);
  }
}
