import { BrandList } from "@/features/brands/components/brand-list";
import { getShopBrands } from "@/features/brands/data/brand.queries";
import { CategoryList } from "@/features/categories/components/category-list";
import { getShopCategories } from "@/features/categories/data/category.queries";
import { ShopHeader } from "@/features/shop/components/shop-header";
import { getShopBySlug } from "@/features/shop/data/get-shop";

type PageProps = {
  params: Promise<{ shop: string }>;
};

export default async function ShopPage({ params }: PageProps) {
  const { shop: slug } = await params;
  const shop = await getShopBySlug(slug);
  const [categories, brands] = await Promise.all([
    getShopCategories(shop.id),
    getShopBrands(shop.id),
  ]);

  return (
    <main>
      <ShopHeader
        name={shop.name}
        description={shop.description}
        logoUrl={shop.logoUrl}
        bannerUrl={shop.bannerUrl}
      />
      <CategoryList shopSlug={shop.slug} categories={categories} />
      <BrandList shopSlug={shop.slug} brands={brands} />
      {/* products grid / other sections go here next */}
    </main>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { shop: slug } = await params;
  const shop = await getShopBySlug(slug);
  return { title: shop?.name ?? "Shop not found" };
}
