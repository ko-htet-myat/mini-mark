"use client";

import { useCartStore } from "@/store/cart-store";
import { useSyncExternalStore } from "react";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function useCart(shopSlug: string) {
  const hydrated = useHydrated();

  const store = useCartStore();

  const items = hydrated && store.shopSlug === shopSlug ? store.items : [];
  const subtotal =
    hydrated && store.shopSlug === shopSlug ? store.subtotal() : 0;

  return {
    hydrated,
    items,
    subtotal,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
  };
}
