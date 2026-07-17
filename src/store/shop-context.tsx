"use client";

import { createContext, useContext } from "react";

type Shop = {
  id: string;
  slug: string;
  name: string;
  ownerId: string;
};

const ShopContext = createContext<Shop | null>(null);

export function ShopProvider({
  shop,
  children,
}: {
  shop: Shop;
  children: React.ReactNode;
}) {
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return shop;
}
