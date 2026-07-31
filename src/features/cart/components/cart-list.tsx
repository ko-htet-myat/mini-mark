"use client";

import { Cancel, Minus, Plus } from "@hugeicons/core-free-icons";
import { useCart } from "../hooks/use-cart";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useShop } from "@/context/shop-context";

const CURRENCY_LOCALE_MAP: Record<string, string> = {
  USD: "en-US",
  MMK: "my-MM",
  JPY: "ja-JP",
  KRW: "ko-KR",
  THB: "th-TH",
};

function getCurrencyFormatter(currency: string) {
  return new Intl.NumberFormat(CURRENCY_LOCALE_MAP[currency] ?? "en-US", {
    style: "currency",
    currency,
  });
}
export function CartList({ shopSlug }: { shopSlug: string }) {
  const t = useTranslations("Cart");
  const { currency } = useShop();
  const formatter = getCurrencyFormatter(currency);
  const { hydrated, items, subtotal, updateQuantity, removeItem } =
    useCart(shopSlug);

  if (!hydrated) return null; // avoid flashing stale/empty state during hydration
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-xl font-medium text-muted-foreground mb-4">
          {t("empty_title")}
        </p>
        <Button asChild>
          <Link href={`/${shopSlug}`}>{t("continue_shopping")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
      {/* Cart Items List */}
      <div className="flex-1">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 pb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase border-b border-border/60">
          <div>{t("product")}</div>
          <div className="text-center">{t("price")}</div>
          <div className="text-center">{t("quantity")}</div>
          <div className="text-center">{t("total")}</div>
          <div className="w-8"></div>
        </div>

        {/* Items */}
        <div className="divide-y divide-border/60">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-6 md:gap-4 items-center py-6"
            >
              {/* Product Info */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 flex items-center justify-center shrink-0 p-2 relative">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
                <div>
                  <div className="text-base font-medium text-foreground mb-1">
                    {item.name}
                  </div>
                  {item.variantLabel && (
                    <div className="text-sm text-muted-foreground">
                      {item.variantLabel}
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-left md:text-center text-sm md:text-base font-medium">
                <span className="md:hidden text-muted-foreground mr-2 font-normal">
                  {t("price")}:
                </span>
                {formatter.format(item.price)}
              </div>

              {/* Quantity */}
              <div className="flex justify-start md:justify-center">
                <div className="flex items-center bg-muted rounded-full px-3 py-1.5">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.variantId,
                        item.quantity - 1,
                      )
                    }
                    className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t("decrease_quantity")}
                  >
                    <HugeiconsIcon icon={Minus} size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        item.variantId,
                        item.quantity + 1,
                      )
                    }
                    className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t("increase_quantity")}
                  >
                    <HugeiconsIcon icon={Plus} size={14} />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="text-left md:text-center text-sm md:text-base font-medium">
                <span className="md:hidden text-muted-foreground mr-2 font-normal">
                  {t("total")}:
                </span>
                {formatter.format(item.price * item.quantity)}
              </div>

              {/* Remove */}
              <div className="flex justify-end absolute md:relative right-4 md:right-0 mt-[-60px] md:mt-0">
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  aria-label={t("remove_item")}
                >
                  <HugeiconsIcon icon={Cancel} size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-full shrink-0 lg:sticky lg:top-8 lg:w-[340px] lg:self-start">
        <div className="bg-muted flex flex-col">
          <div className="p-8 pb-6 border-b border-border/60">
            <h2 className="text-lg font-medium text-foreground mb-6">
              {t("order_summary")}
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-medium">
                  {formatter.format(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("shipping")}</span>
                <span className="font-medium text-foreground">{t("free")}</span>
              </div>
              <div className="pt-2">
                <button className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1.5 transition-colors">
                  {t("add_coupon_code")}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-accent p-8 py-6 flex justify-between items-center">
            <span className="font-medium text-base">{t("total")}</span>
            <span className="font-medium text-base">
              {formatter.format(subtotal)}
            </span>
          </div>
          <Button
            asChild
            className="w-full bg-primary text-primary-foreground uppercase tracking-widest font-semibold rounded-none py-7 h-auto text-xs"
          >
            <Link href={`/${shopSlug}/cart/create-order`}>{t("checkout")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
