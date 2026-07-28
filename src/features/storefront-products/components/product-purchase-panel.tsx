"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  MinusSignIcon,
  StarIcon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductDetailData } from "../types";

interface ProductPurchasePanelProps {
  shopSlug: string;
  product: ProductDetailData;
  onAddToCart?: (selection: {
    productId: string;
    quantity: number;
    attributeValueIds: string[];
  }) => void;
  onBuyItNow?: (selection: {
    productId: string;
    quantity: number;
    attributeValueIds: string[];
  }) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Many attribute values for color (e.g. "Beige", "Black", "Navy") are valid
// CSS color keywords, so we can render a live swatch without a separate
// hex field. Falls back to a neutral dot if the value isn't a CSS color.
function swatchColor(value: string) {
  const probe = new Option().style;
  probe.color = "";
  probe.color = value;
  return probe.color !== "" ? value : "#d4d4d4";
}

export function ProductPurchasePanel({
  shopSlug,
  product,
  onAddToCart,
  onBuyItNow,
}: ProductPurchasePanelProps) {
  const colorGroup = product.attributeGroups.find(
    (g) => g.slug === "color" || g.name.toLowerCase() === "color",
  );
  const sizeGroup = product.attributeGroups.find(
    (g) => g.slug === "size" || g.name.toLowerCase() === "size",
  );
  const otherGroups = product.attributeGroups.filter(
    (g) => g !== colorGroup && g !== sizeGroup,
  );

  const [selectedColorId, setSelectedColorId] = useState(
    colorGroup?.values[0]?.id,
  );
  const [selectedSizeId, setSelectedSizeId] = useState(
    sizeGroup?.values[0]?.id,
  );
  const [quantity, setQuantity] = useState(1);

  const outOfStock = product.stock <= 0;
  const maxQuantity = Math.min(product.stock, 10) || 1;

  const selection = useMemo(
    () => ({
      productId: product.id,
      quantity,
      attributeValueIds: [selectedColorId, selectedSizeId].filter(
        (id): id is string => Boolean(id),
      ),
    }),
    [product.id, quantity, selectedColorId, selectedSizeId],
  );

  const breadcrumb = [
    { label: "Shop", href: `/${shopSlug}` },
    product.category?.parent
      ? {
          label: product.category.parent.name,
          href: `/${shopSlug}/products?category=${product.category.parent.slug}`,
        }
      : null,
    product.category
      ? {
          label: product.category.name,
          href: `/${shopSlug}/products?category=${product.category.slug}`,
        }
      : null,
  ].filter((c): c is { label: string; href: string } => Boolean(c));

  return (
    <div className="flex w-full max-w-md flex-col">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          {breadcrumb.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <span className="text-neutral-300">/</span>}
              <Link href={crumb.href} className="hover:text-neutral-800">
                {crumb.label}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-1">
            <span className="text-neutral-300">/</span>
            <span className="font-medium text-neutral-900">{product.name}</span>
          </li>
        </ol>
      </nav>

      {product.category && (
        <Badge variant="secondary" className="mb-3 w-fit rounded-full">
          {product.category.name}
        </Badge>
      )}

      <h1 className="text-3xl font-bold tracking-tight ">{product.name}</h1>

      {product.rating && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <HugeiconsIcon
                key={i}
                icon={StarIcon}
                size={18}
                fill={
                  i < Math.round(product.rating!.average)
                    ? "currentColor"
                    : "none"
                }
              />
            ))}
          </div>
          <span className="text-sm text-neutral-500">
            ({product.rating.average.toFixed(1)} from {product.rating.count}{" "}
            Reviews)
          </span>
        </div>
      )}

      {/* Price */}
      <div className="mt-5 flex items-baseline gap-3">
        <span className="text-3xl font-bold">
          {currencyFormatter.format(product.price)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="text-lg text-neutral-400 line-through">
            {currencyFormatter.format(product.compareAtPrice)}
          </span>
        )}
      </div>

      {/* Color + Quantity */}
      <div className="mt-6 flex items-start gap-10">
        {colorGroup && (
          <div>
            <p className="mb-2 text-sm font-medium">Available Color</p>
            <div className="flex gap-2">
              {colorGroup.values.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  title={v.value}
                  aria-label={`Select color ${v.value}`}
                  aria-pressed={selectedColorId === v.id}
                  onClick={() => setSelectedColorId(v.id)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    selectedColorId === v.id
                      ? "border-neutral-900 ring-2 ring-offset-2 ring-neutral-300"
                      : "border-neutral-200",
                  )}
                  style={{ backgroundColor: swatchColor(v.value) }}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium ">Quantity</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white disabled:opacity-40"
            >
              <HugeiconsIcon icon={MinusSignIcon} size={16} />
            </button>
            <span className="w-4 text-center font-medium">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= maxQuantity}
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white disabled:opacity-40"
            >
              <HugeiconsIcon icon={Add01Icon} size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Size + any other attributes (e.g. Material) */}
      {sizeGroup && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Available Size</p>
          <div className="flex flex-wrap gap-2">
            {sizeGroup.values.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={selectedSizeId === v.id}
                onClick={() => setSelectedSizeId(v.id)}
                className={cn(
                  "flex h-10 min-w-[44px] items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors",
                  selectedSizeId === v.id
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-400",
                )}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      )}

      {otherGroups.map((group) => (
        <div key={group.id} className="mt-6">
          <p className="mb-2 text-sm font-medium text-neutral-700">
            {group.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.values.map((v) => (
              <span
                key={v.id}
                className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700"
              >
                {v.value}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* CTAs */}
      <div className="mt-8 flex gap-3">
        <Button
          size="lg"
          disabled={outOfStock}
          onClick={() => onBuyItNow?.(selection)}
          className="h-12 flex-1 rounded-full bg-neutral-900 text-white hover:bg-neutral-800"
        >
          {outOfStock ? "Out of stock" : "Buy it now"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          disabled={outOfStock}
          onClick={() => onAddToCart?.(selection)}
          className="h-12 flex-1 rounded-full border-neutral-900 text-neutral-900 hover:bg-neutral-50"
        >
          <HugeiconsIcon icon={ShoppingCart01Icon} size={18} />
          Add to cart
        </Button>
      </div>
    </div>
  );
}
