import Link from "next/link";
import Image from "next/image";
import { ShopProduct } from "../data/products.queries";
import { formatAmount } from "@/lib/format";

export function ProductCard({
  shopSlug,
  product,
  currency = "MMK",
}: {
  shopSlug: string;
  product: ShopProduct;
  currency?: string;
}) {
  const { price, compareAtPrice } = product;
  const onSale = compareAtPrice !== null && compareAtPrice > price;

  return (
    <Link
      href={`/${shopSlug}/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-background"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
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

      <div className="flex flex-col gap-1 p-3">
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
