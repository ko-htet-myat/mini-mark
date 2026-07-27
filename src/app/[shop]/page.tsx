import { notFound } from "next/navigation";
import { ShopHeader } from "@/features/shop/components/shop-header";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { getShopCategories } from "@/features/storefront-categories/data/category.queries";
import { getShopBrands } from "@/features/storefront-brands/data/brand.queries";
import { getShopProducts } from "@/features/storefront-products/data/products.queries";
import { CategoryList } from "@/features/storefront-categories/components/category-list";
import { BrandList } from "@/features/storefront-brands/components/brand-list";
import { ProductGrid } from "@/features/storefront-products/components/product-grid";

type PageProps = {
  params: Promise<{ shop: string }>;
  searchParams: Promise<{ category?: string; brand?: string; page?: string }>;
};

export default async function ShopPage({ params, searchParams }: PageProps) {
  const { shop: slug } = await params;
  const { category, brand, page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const shop = await getShopBySlug(slug);
  if (!shop) {
    notFound();
  }

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
    <main>
      <ShopHeader
        name={shop.name}
        description={shop.description}
        logoUrl={shop.logoUrl}
        bannerUrl={shop.bannerUrl}
        currency={shop.currency}
      />
      <CategoryList shopSlug={shop.slug} categories={categories} />
      <BrandList shopSlug={shop.slug} brands={brands} />
      <ProductGrid
        shopSlug={shop.slug}
        products={productsResult.products}
        page={productsResult.page}
        totalPages={productsResult.totalPages}
        searchParams={{ category, brand }}
        currency={shop.currency}
      />
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { shop: slug } = await params;
  const shop = await getShopBySlug(slug);
  return { title: shop?.name ?? "Shop not found" };
}
