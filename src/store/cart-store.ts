"use client";

import { CartItem } from "@/features/cart/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartStore = {
  shopSlug: string | null;
  items: CartItem[];
  addItem: (shopSlug: string, item: CartItem) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => void;
  clearCart: () => void;
  subtotal: () => number;
};

function sameLine(
  a: { productId: string; variantId: string | null },
  productId: string,
  variantId: string | null,
) {
  return a.productId === productId && a.variantId === variantId;
}

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
          const existing = s.items.find((i) =>
            sameLine(i, item.productId, item.variantId),
          );
          const items = existing
            ? s.items.map((i) =>
                sameLine(i, item.productId, item.variantId)
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

      removeItem: (productId, variantId) =>
        set((s) => ({
          items: s.items.filter((i) => !sameLine(i, productId, variantId)),
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              sameLine(i, productId, variantId)
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
