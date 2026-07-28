"use client";

import { ProductDetailData } from "../types";
import { ProductGallery } from "./product-gallery";
import { ProductPurchasePanel } from "./product-purchase-panel";

interface ProductDetailProps {
  shopSlug: string;
  product: ProductDetailData;
}

export function ProductDetail({ shopSlug, product }: ProductDetailProps) {
  // Wire these to your existing cart store / server action
  // (e.g. Zustand cart store + a `createOrder` / `addToCart` next-safe-action).
  function handleAddToCart(selection: {
    productId: string;
    quantity: number;
    attributeValueIds: string[];
  }) {
    console.log("add to cart", selection);
  }

  function handleBuyItNow(selection: {
    productId: string;
    quantity: number;
    attributeValueIds: string[];
  }) {
    console.log("buy it now", selection);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductPurchasePanel
          shopSlug={shopSlug}
          product={product}
          onAddToCart={handleAddToCart}
          onBuyItNow={handleBuyItNow}
        />
      </div>

      {product.description && (
        <div className="mt-16 max-w-3xl border-t pt-8">
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">
            Description
          </h2>
          <p className="whitespace-pre-line text-neutral-600">
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
}
