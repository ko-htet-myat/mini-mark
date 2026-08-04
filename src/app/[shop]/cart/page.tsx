import { CartList } from "@/features/cart/components/cart-list";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

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
    <main className="container">
      <div className=" py-6 ">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/${shop.slug}`}
            className="hover:text-foreground transition-colors"
          >
            {shop.name}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{t("title")}</span>
        </div>
        <h1 className="mb-6 text-2xl  font-medium tracking-tight text-foreground">
          {t("title")}
        </h1>
        <CartList shopSlug={slug} />
      </div>
    </main>
  );
}
