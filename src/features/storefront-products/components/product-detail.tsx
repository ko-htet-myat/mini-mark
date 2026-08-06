"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon } from "@hugeicons/core-free-icons";
import type { ProductDetailData } from "../types";
import { ProductGallery } from "./product-gallery";
import { ProductPurchasePanel } from "./product-purchase-panel";
import { ProductSpecs } from "./product-specs";
import { useCartStore } from "@/store/cart-store";
import { useShop } from "@/context/shop-context";
import type { SelectedAddon } from "./product-addons";

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

/** Shop categories that show the standalone full-width spec table in the detail section */
const SPECS_CATEGORIES = new Set([
  "ELECTRONICS",
  "AUTOMOTIVE",
  "HOME_GARDEN",
  "BEAUTY",
]);

export function ProductDetail({ shopSlug, product }: ProductDetailProps) {
  const router = useRouter();
  const t = useTranslations("Cart");
  const { shopCategory } = useShop();
  const addItem = useCartStore((s) => s.addItem);

  const youtubeEmbedUrl = product.youtubeUrl
    ? getYouTubeEmbedUrl(product.youtubeUrl)
    : null;

  const showDetailSpecs =
    SPECS_CATEGORIES.has(shopCategory) &&
    product.specifications &&
    Object.keys(product.specifications).length > 0;

  function buildCartItem(selection: {
    productId: string;
    quantity: number;
    variantId: string | null;
    attributeValueIds: string[];
    selectedAddons?: SelectedAddon[];
  }) {
    const variant = product.variants.find((v) => v.id === selection.variantId);

    let variantLabel = null;
    if (selection.attributeValueIds.length > 0) {
      const labels: string[] = [];
      for (const valId of selection.attributeValueIds) {
        for (const group of product.attributeGroups) {
          const val = group.values.find((v) => v.id === valId);
          if (val) labels.push(val.value);
        }
      }
      variantLabel = labels.join(" / ");
    }

    // Append selected addon names to the variant label if present
    if (selection.selectedAddons && selection.selectedAddons.length > 0) {
      const addonLabel = selection.selectedAddons
        .map((a) => a.option.name)
        .join(", ");
      variantLabel = variantLabel
        ? `${variantLabel} · ${addonLabel}`
        : addonLabel;
    }

    const addonExtra = (selection.selectedAddons ?? []).reduce(
      (sum, a) => sum + a.option.price,
      0,
    );

    const maxStock = product.hasVariants
      ? variant
        ? variant.stock
        : product.stock
      : 99;
    const basePrice = variant?.price ?? product.price;
    const price = basePrice + addonExtra;
    const imageUrl =
      variant?.imageUrl ?? product.imageUrl ?? product.images[0] ?? null;

    return {
      id: `${selection.productId}-${selection.variantId}-${variantLabel ?? ""}`,
      productId: selection.productId,
      variantId: selection.variantId,
      name: product.name,
      variantLabel,
      price,
      imageUrl,
      quantity: selection.quantity,
      maxStock,
    };
  }

  function handleAddToCart(selection: {
    productId: string;
    quantity: number;
    variantId: string | null;
    attributeValueIds: string[];
    selectedAddons?: SelectedAddon[];
  }) {
    const item = buildCartItem(selection);
    addItem(shopSlug, item);
    toast.success(t("added_to_cart"));
  }

  function handleBuyItNow(selection: {
    productId: string;
    quantity: number;
    variantId: string | null;
    attributeValueIds: string[];
    selectedAddons?: SelectedAddon[];
  }) {
    const item = buildCartItem(selection);
    addItem(shopSlug, item);
    router.push(`/${shopSlug}/cart/create-order`);
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

        {/* Full-width spec table in the detail section for ELECTRONICS / AUTOMOTIVE / HOME_GARDEN / BEAUTY */}
        {showDetailSpecs && (
          <ProductSpecs specifications={product.specifications!} />
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
                    sizes="48px"
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
