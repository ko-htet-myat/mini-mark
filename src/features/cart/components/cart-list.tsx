"use client";

import { ArrowRight, Cancel, Minus, Plus } from "@hugeicons/core-free-icons";
import { useCart } from "../hooks/use-cart";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";

export function CartList({ shopSlug }: { shopSlug: string }) {
  const { hydrated, items, subtotal, updateQuantity, removeItem } =
    useCart(shopSlug);

  if (!hydrated) return null; // avoid flashing stale/empty state during hydration
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-xl font-medium text-muted-foreground mb-4">
          Your cart is empty.
        </p>
        <Button asChild>
          <a href={`/${shopSlug}`}>Continue Shopping</a>
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
          <div>Product</div>
          <div className="text-center">Price</div>
          <div className="text-center">Quantity</div>
          <div className="text-center">Total</div>
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
                <div className="w-24 h-24 bg-muted flex items-center justify-center shrink-0 p-2 relative">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-contain mix-blend-multiply"
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
                  Price:
                </span>
                ${item.price.toFixed(0)}
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
                    aria-label="Decrease quantity"
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
                    aria-label="Increase quantity"
                  >
                    <HugeiconsIcon icon={Plus} size={14} />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="text-left md:text-center text-sm md:text-base font-medium">
                <span className="md:hidden text-muted-foreground mr-2 font-normal">
                  Total:
                </span>
                ${(item.price * item.quantity).toFixed(0)}
              </div>

              {/* Remove */}
              <div className="flex justify-end absolute md:relative right-4 md:right-0 mt-[-60px] md:mt-0">
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  aria-label="Remove item"
                >
                  <HugeiconsIcon icon={Cancel} size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-[340px] shrink-0">
        <div className="bg-muted flex flex-col">
          <div className="p-8 pb-6 border-b border-border/60">
            <h2 className="text-lg font-medium text-foreground mb-6">
              Order Summary
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-foreground">Free</span>
              </div>
              <div className="pt-2">
                <button className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1.5 transition-colors">
                  Add coupon code <HugeiconsIcon icon={ArrowRight} size={14} />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-accent p-8 py-6 flex justify-between items-center">
            <span className="font-medium text-base">Total</span>
            <span className="font-medium text-base">
              ${subtotal.toFixed(0)}
            </span>
          </div>
          <Button className="w-full bg-primary text-primary-foreground uppercase tracking-widest font-semibold rounded-none py-7 h-auto text-xs">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
