"use client";

import { CartItem } from "@/features/cart/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartStore = {
  shopSlug: string | null;
  items: CartItem[];
  addItem: (shopSlug: string, item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
};

// sameLine removed

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      shopSlug: null,
      items: [],

      addItem: (shopSlug, item) => {
        const state = get();

        // cart is single-shop: switching shops replaces the cart
        if (state.shopSlug && state.shopSlug !== shopSlug) {
          set({ shopSlug, items: [] });
        }

        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          const items = existing
            ? s.items.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      quantity: Math.min(
                        i.quantity + item.quantity,
                        i.maxStock,
                      ),
                    }
                  : i,
              )
            : [...s.items, item];

          return { shopSlug, items };
        });
      },

      removeItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.id === id
                ? {
                    ...i,
                    quantity: Math.max(1, Math.min(quantity, i.maxStock)),
                  }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ shopSlug: null, items: [] }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "cart-storage", // single localStorage key; shopSlug field handles scoping
    },
  ),
);
