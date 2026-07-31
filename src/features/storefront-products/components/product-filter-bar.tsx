import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count: { products: number };
};

type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  _count: { products: number };
};

type Props = {
  shopSlug: string;
  categories: Category[];
  brands: Brand[];
  activeCategory?: string;
  activeBrand?: string;
};

function buildFilterHref(
  shopSlug: string,
  params: Record<string, string | undefined>,
): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "",
  ) as [string, string][];
  const qs = new URLSearchParams(entries);
  const search = qs.toString();
  return `/${shopSlug}/products${search ? `?${search}` : ""}`;
}

export async function ProductFilterBar({
  shopSlug,
  categories,
  brands,
  activeCategory,
  activeBrand,
}: Props) {
  const t = await getTranslations("Storefront");

  const hasFilters = Boolean(activeCategory || activeBrand);

  return (
    <div className="space-y-4">
      {/* Category chips */}
      {categories.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("categories")}
          </p>
          <div className="flex flex-wrap gap-2">
            {/* "All" chip */}
            <Link
              href={buildFilterHref(shopSlug, {
                brand: activeBrand,
              })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                !activeCategory
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              {t("all")}
            </Link>

            {categories.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={buildFilterHref(shopSlug, {
                    category: isActive ? undefined : cat.slug,
                    brand: activeBrand,
                  })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {cat.imageUrl && (
                    <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={cat.imageUrl}
                        alt=""
                        fill
                        sizes="16px"
                        className="object-cover"
                      />
                    </span>
                  )}
                  {cat.name}
                  <span
                    className={cn(
                      "rounded-full px-1 text-[10px]",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {cat._count.products}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand chips */}
      {brands.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("brands")}
          </p>
          <div className="flex flex-wrap gap-2">
            {/* "All" chip */}
            <Link
              href={buildFilterHref(shopSlug, {
                category: activeCategory,
              })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                !activeBrand
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              {t("all")}
            </Link>

            {brands.map((brand) => {
              const isActive = activeBrand === brand.slug;
              return (
                <Link
                  key={brand.id}
                  href={buildFilterHref(shopSlug, {
                    category: activeCategory,
                    brand: isActive ? undefined : brand.slug,
                  })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  {brand.logoUrl && (
                    <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded-sm">
                      <Image
                        src={brand.logoUrl}
                        alt=""
                        fill
                        sizes="16px"
                        className="object-contain"
                      />
                    </span>
                  )}
                  {brand.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear all filters */}
      {hasFilters && (
        <Link
          href={`/${shopSlug}/products`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {t("clear_filters")}
        </Link>
      )}
    </div>
  );
}
