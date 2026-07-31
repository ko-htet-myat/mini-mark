import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { getShopCategories } from "@/features/storefront-categories/data/category.queries";
import { getShopBrands } from "@/features/storefront-brands/data/brand.queries";
import { getShopProducts } from "@/features/storefront-products/data/products.queries";
import { ProductFilterBar } from "@/features/storefront-products/components/product-filter-bar";
import { ProductGrid } from "@/features/storefront-products/components/product-grid";

type PageProps = {
  params: Promise<{ shop: string }>;
  searchParams: Promise<{
    category?: string;
    brand?: string;
    page?: string;
  }>;
};

export default async function ShopProductListPage({
  params,
  searchParams,
}: PageProps) {
  const { shop: slug } = await params;
  const { category, brand, page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const shop = await getShopBySlug(slug);
  if (!shop) {
    notFound();
  }

  const t = await getTranslations("Storefront");

  const [categories, brands, productsResult] = await Promise.all([
    getShopCategories(shop.id),
    getShopBrands(shop.id),
    getShopProducts({
      shopId: shop.id,
      page,
      categorySlug: category,
      brandSlug: brand,
    }),
  ]);

  return (
    <main className="py-6">
      {/* Breadcrumb / back link */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={`/${shop.slug}`}
          className="hover:text-foreground transition-colors"
        >
          {shop.name}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">
          {t("products_title")}
        </span>
      </div>

      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {t("products_title")}
      </h1>

      {/* Filters */}
      {(categories.length > 0 || brands.length > 0) && (
        <div className="mb-8">
          <ProductFilterBar
            shopSlug={shop.slug}
            categories={categories}
            brands={brands}
            activeCategory={category}
            activeBrand={brand}
          />
        </div>
      )}

      {/* Product grid */}
      <ProductGrid
        shopSlug={shop.slug}
        products={productsResult.products}
        page={productsResult.page}
        totalPages={productsResult.totalPages}
        searchParams={{ category, brand }}
        currency={shop.currency}
        basePath={`/${shop.slug}/products`}
      />
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { shop: slug } = await params;
  const shop = await getShopBySlug(slug);
  return {
    title: shop ? `${shop.name} — Products` : "Products",
  };
}
