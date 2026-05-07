import { describe, it, expect } from 'vitest';
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  calculateCartTotal,
  calculateCartItemCount,
} from '../use-cases/cart.use-cases';
import type { Product, CartItem } from '../domain/entities/product';

// ─── Fixtures ──────────────────────────────────────────────────

const mockProduct: Product = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Pulpa de Mango',
  description: 'Pulpa de mango 100% natural',
  price: 150,
  stock: 50,
  unit: 'lb',
  image_url: null,
  category_id: '550e8400-e29b-41d4-a716-446655440001',
  is_combo: false,
  is_featured: true,
  benefits: ['Vitamina A', 'Energizante'],
  created_at: '2025-01-01T00:00:00+00:00',
  updated_at: '2025-01-01T00:00:00+00:00',
};

const mockProduct2: Product = {
  ...mockProduct,
  id: '550e8400-e29b-41d4-a716-446655440002',
  name: 'Pulpa de Chinola',
  price: 180,
};

// ─── Tests ─────────────────────────────────────────────────────

describe('Cart Use Cases', () => {
  describe('addToCart', () => {
    it('should add a new product to an empty cart', () => {
      const result = addToCart([], mockProduct);
      expect(result).toHaveLength(1);
      expect(result[0].product.id).toBe(mockProduct.id);
      expect(result[0].quantity).toBe(1);
    });

    it('should add a product with a custom quantity', () => {
      const result = addToCart([], mockProduct, 3);
      expect(result[0].quantity).toBe(3);
    });

    it('should increment quantity if product already exists', () => {
      const initial: CartItem[] = [{ product: mockProduct, quantity: 2 }];
      const result = addToCart(initial, mockProduct, 3);
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(5);
    });

    it('should not modify other products when adding', () => {
      const initial: CartItem[] = [{ product: mockProduct, quantity: 1 }];
      const result = addToCart(initial, mockProduct2);
      expect(result).toHaveLength(2);
      expect(result[0].quantity).toBe(1);
      expect(result[1].product.id).toBe(mockProduct2.id);
    });
  });

  describe('removeFromCart', () => {
    it('should remove a product from the cart', () => {
      const initial: CartItem[] = [
        { product: mockProduct, quantity: 1 },
        { product: mockProduct2, quantity: 2 },
      ];
      const result = removeFromCart(initial, mockProduct.id);
      expect(result).toHaveLength(1);
      expect(result[0].product.id).toBe(mockProduct2.id);
    });

    it('should return empty array if last item is removed', () => {
      const initial: CartItem[] = [{ product: mockProduct, quantity: 1 }];
      const result = removeFromCart(initial, mockProduct.id);
      expect(result).toHaveLength(0);
    });

    it('should do nothing if product not found', () => {
      const initial: CartItem[] = [{ product: mockProduct, quantity: 1 }];
      const result = removeFromCart(initial, 'non-existent-id');
      expect(result).toHaveLength(1);
    });
  });

  describe('updateCartQuantity', () => {
    it('should update the quantity of a product', () => {
      const initial: CartItem[] = [{ product: mockProduct, quantity: 1 }];
      const result = updateCartQuantity(initial, mockProduct.id, 5);
      expect(result[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0 or negative', () => {
      const initial: CartItem[] = [{ product: mockProduct, quantity: 3 }];
      const result = updateCartQuantity(initial, mockProduct.id, 0);
      expect(result).toHaveLength(0);
    });
  });

  describe('calculateCartTotal', () => {
    it('should return 0 for empty cart', () => {
      expect(calculateCartTotal([])).toBe(0);
    });

    it('should calculate total correctly', () => {
      const items: CartItem[] = [
        { product: mockProduct, quantity: 2 },  // 150 * 2 = 300
        { product: mockProduct2, quantity: 3 }, // 180 * 3 = 540
      ];
      expect(calculateCartTotal(items)).toBe(798); // 840 - 5% discount (count = 5)
    });
  });

  describe('calculateCartItemCount', () => {
    it('should return 0 for empty cart', () => {
      expect(calculateCartItemCount([])).toBe(0);
    });

    it('should count all items', () => {
      const items: CartItem[] = [
        { product: mockProduct, quantity: 2 },
        { product: mockProduct2, quantity: 3 },
      ];
      expect(calculateCartItemCount(items)).toBe(5);
    });
  });
});
