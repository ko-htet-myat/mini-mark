import { CartList } from "@/features/cart/components/cart-list";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { notFound } from "next/navigation";
import { ShopHeader } from "@/features/shop/components/shop-header";

export default async function ShopCartPage({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop: slug } = await params;

  const shop = await getShopBySlug(slug);
  if (!shop) {
    notFound();
  }

  return (
    <main>
      <ShopHeader
        name={shop.name}
        description={shop.description}
        logoUrl={shop.logoUrl}
        bannerUrl={shop.bannerUrl}
        currency={shop.currency}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h1 className="mb-12 text-center text-4xl md:text-5xl font-medium tracking-tight text-foreground">
          Your Cart
        </h1>
        <CartList shopSlug={slug} />
      </div>
    </main>
  );
}
