"use client";

import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon } from "@hugeicons/core-free-icons";
import type { ProductDetailData } from "../types";
import { ProductGallery } from "./product-gallery";
import { ProductPurchasePanel } from "./product-purchase-panel";

interface ProductDetailProps {
  shopSlug: string;
  product: ProductDetailData;
}

function getYouTubeEmbedUrl(url: string) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export function ProductDetail({ shopSlug, product }: ProductDetailProps) {
  const youtubeEmbedUrl = product.youtubeUrl
    ? getYouTubeEmbedUrl(product.youtubeUrl)
    : null;

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
    <div className="py-8">
      <div className=" flex flex-col md:flex-row gap-5">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductPurchasePanel
          shopSlug={shopSlug}
          product={product}
          onAddToCart={handleAddToCart}
          onBuyItNow={handleBuyItNow}
        />
      </div>

      <div className="mt-16 border-t pt-8 space-y-10">
        {product.description && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Description
            </h2>
            <p className="whitespace-pre-line text-muted-foreground">
              {product.description}
            </p>
          </div>
        )}

        {youtubeEmbedUrl && (
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
              <HugeiconsIcon icon={PlayIcon} size={20} />
              Video
            </h2>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                src={youtubeEmbedUrl}
                title="Product video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        )}

        {product.brand && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Brand
            </h2>
            <Link
              href={`/${shopSlug}/products?brand=${product.brand.slug}`}
              className="group flex items-center gap-3"
            >
              {product.brand.logoUrl ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={product.brand.logoUrl}
                    alt={product.brand.name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-sm font-bold text-muted-foreground">
                  {product.brand.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-foreground group-hover:underline">
                  {product.brand.name}
                </p>
                {product.brand.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.brand.description}
                  </p>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
