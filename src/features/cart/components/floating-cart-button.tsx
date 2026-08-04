"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel,
  Minus,
  Plus,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useShop } from "@/context/shop-context";
import { useCart } from "@/features/cart/hooks/use-cart";
import { getCurrencyFormatter } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function FloatingCartButton({ shopSlug }: { shopSlug: string }) {
  const t = useTranslations("Cart");
  const pathname = usePathname();
  const { currency } = useShop();
  const { hydrated, items, itemCount, subtotal, updateQuantity, removeItem } =
    useCart(shopSlug);
  const formatter = getCurrencyFormatter(currency);
  const isMobile = useIsMobile();

  if (
    !hydrated ||
    pathname.includes("/dashboard") ||
    pathname.includes("/cart")
  )
    return null;

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          size="icon"
          aria-label={t("open_cart")}
          className="fixed right-4 bottom-5 z-40 h-14 w-14 rounded-full shadow-lg sm:right-6 sm:bottom-6"
        >
          <HugeiconsIcon icon={ShoppingCart01Icon} size={24} />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground ring-2 ring-background">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className=" w-full gap-0 p-0 sm:max-w-md">
        <DrawerHeader className="border-b px-5 py-4">
          <DrawerTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={ShoppingCart01Icon} size={20} />
            {t("title")}
          </DrawerTitle>
        </DrawerHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <HugeiconsIcon icon={ShoppingCart01Icon} size={26} />
            </div>
            <p className="text-base font-medium text-foreground">
              {t("empty_title")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("empty_description")}
            </p>
            <DrawerClose asChild>
              <Button asChild className="mt-6">
                <Link href={`/${shopSlug}`}>{t("continue_shopping")}</Link>
              </Button>
            </DrawerClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-4 py-4"
                  >
                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="72px"
                          className="object-contain p-1"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">
                            {item.name}
                          </p>
                          {item.variantLabel && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {item.variantLabel}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label={t("remove_item")}
                        >
                          <HugeiconsIcon icon={Cancel} size={14} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex h-9 items-center rounded-full bg-muted px-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity - 1,
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                            aria-label={t("decrease_quantity")}
                          >
                            <HugeiconsIcon icon={Minus} size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1,
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                            aria-label={t("increase_quantity")}
                          >
                            <HugeiconsIcon icon={Plus} size={14} />
                          </button>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium" suppressHydrationWarning>
                            {formatter.format(item.price * item.quantity)}
                          </p>
                          <p
                            className="text-xs text-muted-foreground"
                            suppressHydrationWarning
                          >
                            {formatter.format(item.price)} {t("each")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DrawerFooter className="border-t bg-background px-5 py-4">
              <div className="mb-2 flex items-center justify-between text-base">
                <span className="font-medium">{t("subtotal")}</span>
                <span className="font-semibold" suppressHydrationWarning>
                  {formatter.format(subtotal)}
                </span>
              </div>
              <DrawerClose asChild>
                <Button asChild className="w-full">
                  <Link href={`/${shopSlug}/cart/create-order`}>
                    {t("checkout")}
                  </Link>
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/${shopSlug}/cart`}>{t("view_cart")}</Link>
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
