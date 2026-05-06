/**
 * Product Types — Re-exports from @pulpas/core.
 * Keeps backward compatibility with existing imports while
 * the single source of truth lives in packages/core.
 */

export type {
  Category,
  Product,
  ProductWithCategory,
  CartItem,
} from '../../../../packages/core/domain/entities/product';

// Re-export schemas for direct validation in components if needed
export {
  CategorySchema,
  ProductSchema,
  ProductWithCategorySchema,
} from '../../../../packages/core/domain/entities/product';
