import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ShopProduct } from "../data/products.queries";
import { formatAmount } from "@/lib/format";

export function ProductCard({
  shopSlug,
  product,
  loading,
  currency = "MMK",
  variant = "grid",
}: {
  shopSlug: string;
  product: ShopProduct;
  loading?: "lazy" | "eager";
  currency?: string;
  variant?: "grid" | "list";
}) {
  const { price, compareAtPrice } = product;
  const onSale = compareAtPrice !== null && compareAtPrice > price;

  return (
    <Link
      href={`/${shopSlug}/products/${product.id}`}
      className={cn(
        "group flex overflow-hidden rounded-lg border bg-background",
        variant === "grid"
          ? "flex-col"
          : "flex-row items-stretch sm:items-center",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-muted",
          variant === "grid"
            ? "aspect-square w-full"
            : "aspect-square w-28 sm:w-40",
        )}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority={loading === "eager"}
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        {product.status === "OUT_OF_STOCK" && (
          <span className="absolute left-2 top-2 rounded bg-background/90 px-2 py-0.5 text-[10px] font-medium">
            Out of stock
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-1 p-3",
          variant === "list" && "sm:justify-center sm:p-4",
        )}
      >
        <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {formatAmount(price, currency)}
          </span>
          {onSale && (
            <span className="text-xs text-muted-foreground line-through">
              {formatAmount(compareAtPrice!, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
