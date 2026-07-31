import { CartList } from "@/features/cart/components/cart-list";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { notFound } from "next/navigation";
import { ShopHeader } from "@/features/shop/components/shop-header";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ShopCartPage({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop: slug } = await params;

  const t = await getTranslations("Cart");
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
        <div className="mb-8 flex justify-start">
          <Button asChild variant="outline">
            <Link href={`/${slug}`}>{t("back_to_shop")}</Link>
          </Button>
        </div>
        <h1 className="mb-12 text-center text-4xl md:text-5xl font-medium tracking-tight text-foreground">
          {t("title")}
        </h1>
        <CartList shopSlug={slug} />
      </div>
    </main>
  );
}
