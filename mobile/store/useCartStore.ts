import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/lib/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        let newItems;
        if (existingItem) {
          newItems = items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          newItems = [...items, { ...product, quantity }];
        }

        const total = newItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        set({ items: newItems, total });
      },
      removeItem: (productId) => {
        const newItems = get().items.filter((item) => item.id !== productId);
        const total = newItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        set({ items: newItems, total });
      },
      updateQuantity: (productId, quantity) => {
        const newItems = get().items.map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        const total = newItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        set({ items: newItems, total });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage-mobile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
