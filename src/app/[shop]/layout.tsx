import { getShopBySlug } from "@/features/shop/data/get-shop";
import { ShopProvider } from "@/context/shop-context";
import { FloatingCartButton } from "@/features/cart/components/floating-cart-button";

export default async function ShopLayout({
  params,
  children,
}: {
  params: Promise<{ shop: string }>;
  children: React.ReactNode;
}) {
  const { shop: slug } = await params;
  const shop = await getShopBySlug(slug);
  return (
    <ShopProvider
      shop={{
        id: shop.id,
        slug: shop.slug,
        name: shop.name,
        ownerId: shop.ownerId,
        logoUrl: shop.logoUrl,
        bannerUrl: shop.bannerUrl,
        currency: shop.currency,
        shopCategory: shop.shopCategory,
      }}
    >
      {children}
      <FloatingCartButton shopSlug={shop.slug} />
    </ShopProvider>
  );
}
