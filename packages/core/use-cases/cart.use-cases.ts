/**
 * Cart Domain Logic — Pure functions for cart operations.
 * Framework agnostic: can be used from Zustand (web) or any RN state manager.
 */

import type { Product, CartItem } from '../domain/entities/product';

/** Add a product to the cart. If it already exists, increment quantity. */
export function addToCart(
  items: CartItem[],
  product: Product,
  quantity = 1
): CartItem[] {
  const existing = items.find((item) => item.product.id === product.id);

  if (existing) {
    return items.map((item) =>
      item.product.id === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  }

  return [...items, { product, quantity }];
}

/** Remove a product from the cart. */
export function removeFromCart(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.product.id !== productId);
}

/** Update the quantity of a cart item. */
export function updateCartQuantity(
  items: CartItem[],
  productId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) return removeFromCart(items, productId);
  return items.map((item) =>
    item.product.id === productId ? { ...item, quantity } : item
  );
}

/** Calculate the subtotal of the cart (before discounts). */
export function calculateCartSubtotal(items: CartItem[]): number {
  return items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
}

/** Calculate the total item count. */
export function calculateCartItemCount(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

/** 
 * Calculate the discount amount based on volume. 
 * Escala de descuentos por volumen:
 * 3 a 5 unidades: 5%
 * 6 a 11 unidades: 10%
 * 12+ unidades: 15%
 */
export function calculateCartDiscount(items: CartItem[]): number {
  const count = calculateCartItemCount(items);
  const subtotal = calculateCartSubtotal(items);
  
  if (count >= 12) {
    return subtotal * 0.15;
  } else if (count >= 6) {
    return subtotal * 0.10;
  } else if (count >= 3) {
    return subtotal * 0.05;
  }
  
  return 0;
}

/** Calculate the final total of the cart after discounts. */
export function calculateCartTotal(items: CartItem[]): number {
  const subtotal = calculateCartSubtotal(items);
  const discount = calculateCartDiscount(items);
  return subtotal - discount;
}
