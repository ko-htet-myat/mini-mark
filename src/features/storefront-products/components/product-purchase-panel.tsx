"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  MinusSignIcon,
  StarIcon,
  ShoppingCart01Icon,
  SaleTag01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useShop } from "@/context/shop-context";
import type { ProductDetailData } from "../types";
import {
  findMatchingVariant,
  getAvailableStockForSelection,
  hasVariantForSelection,
} from "../utils/variant-selection";

interface ProductPurchasePanelProps {
  shopSlug: string;
  product: ProductDetailData;
  onAddToCart?: (selection: {
    productId: string;
    quantity: number;
    variantId: string | null;
    attributeValueIds: string[];
  }) => void;
  onBuyItNow?: (selection: {
    productId: string;
    quantity: number;
    variantId: string | null;
    attributeValueIds: string[];
  }) => void;
}

const CURRENCY_LOCALE_MAP: Record<string, string> = {
  USD: "en-US",
  MMK: "my-MM",
  JPY: "ja-JP",
  KRW: "ko-KR",
  THB: "th-TH",
};

function getCurrencyFormatter(currency: string) {
  const locale = CURRENCY_LOCALE_MAP[currency] ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
}

const fallbackSwatchColor = "#d4d4d4";
const namedSwatchColors: Record<string, string> = {
  black: "#000000",
  blue: "#2563eb",
  brown: "#92400e",
  gold: "#f59e0b",
  gray: "#737373",
  green: "#16a34a",
  grey: "#737373",
  orange: "#f97316",
  pink: "#ec4899",
  purple: "#9333ea",
  red: "#dc2626",
  silver: "#a3a3a3",
  white: "#ffffff",
  yellow: "#eab308",
};

function swatchColor(value: string) {
  const color = value.trim().toLowerCase();

  if (!color) return fallbackSwatchColor;
  if (namedSwatchColors[color]) return namedSwatchColors[color];
  if (/^#[\da-f]{3,8}$/i.test(color)) return color;
  if (/^(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(/i.test(color)) {
    return color;
  }

  return fallbackSwatchColor;
}

function isColorGroup(group: { slug: string; name: string }) {
  return group.slug === "color" || group.name.toLowerCase() === "color";
}

export function ProductPurchasePanel({
  shopSlug,
  product,
  onAddToCart,
  onBuyItNow,
}: ProductPurchasePanelProps) {
  const { currency } = useShop();
  const currencyFormatter = useMemo(
    () => getCurrencyFormatter(currency),
    [currency],
  );
  const groups = product.attributeGroups;

  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    for (const group of groups) {
      initial[group.id] = group.values[0]?.id ?? "";
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);

  const selectedAttrValueIds = useMemo(
    () => Object.values(selectedAttributes).filter((id) => id !== ""),
    [selectedAttributes],
  );

  const matchedVariant = useMemo(() => {
    return findMatchingVariant(product.variants, selectedAttrValueIds);
  }, [selectedAttrValueIds, product.variants]);

  const availableStock = getAvailableStockForSelection(
    product.variants,
    selectedAttrValueIds,
    product.stock,
  );
  const outOfStock = availableStock <= 0;
  const maxQuantity = Math.min(availableStock, 99) || 1;

  const displayPrice =
    matchedVariant?.price != null ? matchedVariant.price : product.price;
  const displayCompareAtPrice =
    matchedVariant?.compareAtPrice ?? product.compareAtPrice;

  const selection = useMemo(
    () => ({
      productId: product.id,
      quantity,
      variantId: matchedVariant?.id ?? null,
      attributeValueIds: selectedAttrValueIds,
    }),
    [product.id, quantity, matchedVariant, selectedAttrValueIds],
  );

  function selectAttribute(groupId: string, valueId: string) {
    setSelectedAttributes((prev) => ({ ...prev, [groupId]: valueId }));
    setQuantity(1);
  }

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
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {breadcrumb.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <span className="text-muted-foreground/50">/</span>}
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-1">
            <span className="text-muted-foreground/50">/</span>
            <span className="font-medium text-foreground">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className=" flex gap-3 align-items-center mb-3">
        {product.brand && (
          <Link
            href={`/${shopSlug}/products?brand=${product.brand.slug}`}
            className="mb-1 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {product.brand.logoUrl ? (
              <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded">
                <Image
                  src={product.brand.logoUrl}
                  alt={product.brand.name}
                  fill
                  sizes="20px"
                  className="object-contain"
                />
              </div>
            ) : null}
            {product.brand.name}
          </Link>
        )}

        {/* {product.category && (
          <Badge variant="secondary" className=" w-fit rounded-full">
            {product.category.name}
          </Badge>
        )} */}
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {product.name}
      </h1>

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
          <span className="text-sm text-muted-foreground">
            ({product.rating.average.toFixed(1)} from {product.rating.count}{" "}
            Reviews)
          </span>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <span className="text-2xl font-bold">
          {currencyFormatter.format(displayPrice)}
        </span>
        {displayCompareAtPrice && displayCompareAtPrice > displayPrice && (
          <span className="text-lg text-muted-foreground line-through">
            {currencyFormatter.format(displayCompareAtPrice)}
          </span>
        )}
        {product.promotions.map((promo) => {
          const discountLabel =
            promo.discountType === "PERCENTAGE"
              ? `${promo.discountValue}% OFF`
              : `-${currencyFormatter.format(promo.discountValue)}`;
          return (
            <Badge
              key={promo.id}
              className="flex items-center gap-1 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            >
              <HugeiconsIcon icon={SaleTag01Icon} size={14} />
              {discountLabel}
            </Badge>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {groups.map((group) => {
          if (isColorGroup(group)) {
            return (
              <div key={group.id}>
                <p className="mb-2 text-sm font-medium">Available Color</p>
                <div className="flex gap-2">
                  {group.values.map((v) => {
                    const isUnavailable = !hasVariantForSelection(
                      product.variants,
                      selectedAttributes,
                      group.id,
                      v.id,
                    );

                    return (
                      <button
                        key={v.id}
                        type="button"
                        title={v.value}
                        aria-label={`Select color ${v.value}`}
                        aria-pressed={selectedAttributes[group.id] === v.id}
                        disabled={isUnavailable}
                        onClick={() => selectAttribute(group.id, v.id)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-all disabled:cursor-not-allowed disabled:opacity-35",
                          selectedAttributes[group.id] === v.id
                            ? "border-foreground ring-2 ring-offset-2 ring-offset-background ring-foreground/20"
                            : "border-border",
                        )}
                        style={{ backgroundColor: swatchColor(v.value) }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div key={group.id}>
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {group.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.values.map((v) => {
                  const isUnavailable = !hasVariantForSelection(
                    product.variants,
                    selectedAttributes,
                    group.id,
                    v.id,
                  );

                  return (
                    <button
                      key={v.id}
                      type="button"
                      aria-pressed={selectedAttributes[group.id] === v.id}
                      disabled={isUnavailable}
                      onClick={() => selectAttribute(group.id, v.id)}
                      className={cn(
                        "flex h-10 min-w-[44px] items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35",
                        selectedAttributes[group.id] === v.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground/30",
                      )}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quantity */}
        <div>
          <p className="mb-2 text-sm font-medium ">Quantity</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-40"
            >
              <HugeiconsIcon icon={MinusSignIcon} size={16} />
            </button>
            <span className="w-4 text-center font-medium">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= maxQuantity}
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background disabled:opacity-40"
            >
              <HugeiconsIcon icon={Add01Icon} size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* SKU + Stock count */}
      <div className="mt-6 flex items-center gap-4 text-sm">
        {matchedVariant?.sku && (
          <span className="text-muted-foreground">
            SKU:{" "}
            <span className="font-mono text-foreground">
              {matchedVariant.sku}
            </span>
          </span>
        )}
        {!outOfStock ? (
          <span className="text-green-600 dark:text-green-400">
            {availableStock <= 5
              ? `Only ${availableStock} left in stock`
              : `${availableStock} in stock`}
          </span>
        ) : (
          <span className="text-destructive">Out of stock</span>
        )}
      </div>

      {/* CTAs */}
      <div className="mt-3 flex gap-3">
        <Button
          size="lg"
          disabled={outOfStock}
          onClick={() => onBuyItNow?.(selection)}
          className="h-12 flex-1 rounded-full bg-foreground text-background hover:bg-foreground/90"
        >
          Buy it now
        </Button>
        <Button
          size="lg"
          variant="outline"
          disabled={outOfStock}
          onClick={() => onAddToCart?.(selection)}
          className="h-12 flex-1 rounded-full"
        >
          <HugeiconsIcon icon={ShoppingCart01Icon} size={18} />
          Add to cart
        </Button>
      </div>
    </div>
  );
}
