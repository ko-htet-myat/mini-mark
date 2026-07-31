import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductFilterSelect } from "./product-filter-select";

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
      <div className="flex flex-wrap items-start gap-4">
        {categories.length > 0 && (
          <ProductFilterSelect
            shopSlug={shopSlug}
            label={t("categories")}
            paramKey="category"
            otherParams={{ brand: activeBrand }}
            options={categories.map((category) => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
              imageUrl: category.imageUrl,
              count: category._count.products,
            }))}
            activeValue={activeCategory}
            allLabel={t("all")}
          />
        )}

        {brands.length > 0 && (
          <ProductFilterSelect
            shopSlug={shopSlug}
            label={t("brands")}
            paramKey="brand"
            otherParams={{ category: activeCategory }}
            options={brands.map((brand) => ({
              id: brand.id,
              name: brand.name,
              slug: brand.slug,
              imageUrl: brand.logoUrl,
              count: brand._count.products,
            }))}
            activeValue={activeBrand}
            allLabel={t("all")}
          />
        )}
      </div>

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
