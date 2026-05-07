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
 * Calculate the discount amount based on order value. 
 * Escala de descuentos por volumen:
 * RD$5,000 - $9,999: 5%
 * RD$10,000 - $19,999: 10%
 * RD$20,000+: 15%
 */
export function calculateCartDiscount(items: CartItem[]): number {
  const subtotal = calculateCartSubtotal(items);
  
  if (subtotal >= 20000) {
    return subtotal * 0.15;
  } else if (subtotal >= 10000) {
    return subtotal * 0.10;
  } else if (subtotal >= 5000) {
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
