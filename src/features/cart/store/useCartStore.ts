"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "../../../../packages/core/domain/entities/product";
import {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  calculateCartTotal,
  calculateCartSubtotal,
  calculateCartDiscount,
} from "../../../../packages/core/use-cases/cart.use-cases";

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      addItem: (product, quantity = 1) => {
        set({ items: addToCart(get().items, product, quantity) });
      },

      removeItem: (productId) => {
        set({ items: removeFromCart(get().items, productId) });
      },

      updateQuantity: (productId, quantity) => {
        set({ items: updateCartQuantity(get().items, productId, quantity) });
      },

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      getSubtotal: () => calculateCartSubtotal(get().items),
      getDiscount: () => calculateCartDiscount(get().items),
      getTotal: () => calculateCartTotal(get().items),
      getItemCount: () => get().items.reduce((acc, it) => acc + it.quantity, 0),
    }),
    {
      name: "cart-storage-v2",
      merge: (persistedState: unknown, currentState) => ({
        ...currentState,
        items: (persistedState as { items?: CartItem[] })?.items || [],
        hydrated: true,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
