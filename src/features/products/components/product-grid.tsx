import Link from "next/link";
import { ProductCard } from "./product-card";
import { ShopProduct } from "../data/products.queries";

type ProductGridProps = {
  shopSlug: string;
  products: ShopProduct[];
  page: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
  currency?: string;
};

function buildPageHref(
  shopSlug: string,
  page: number,
  searchParams?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams(
    Object.entries(searchParams ?? {}).filter(([, v]) => v !== undefined) as [
      string,
      string,
    ][],
  );
  params.set("page", String(page));
  return `/${shopSlug}#products?${params.toString()}`;
}

export function ProductGrid({
  shopSlug,
  products,
  page,
  totalPages,
  searchParams,
  currency,
}: ProductGridProps) {
  return (
    <section id="products" className="px-6 py-6">
      <h2 className="mb-3 text-lg font-semibold">Products</h2>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              shopSlug={shopSlug}
              product={product}
              currency={currency}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildPageHref(shopSlug, page - 1, searchParams)}
              className="text-sm underline"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageHref(shopSlug, page + 1, searchParams)}
              className="text-sm underline"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
