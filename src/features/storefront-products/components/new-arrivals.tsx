"use client";

import { useTranslations } from "next-intl";
import { ProductCard } from "./product-card";
import type { ShopProduct } from "../data/products.queries";

type NewArrivalsProps = {
  shopSlug: string;
  products: ShopProduct[];
  currency?: string;
};

export function NewArrivals({
  shopSlug,
  products,
  currency,
}: NewArrivalsProps) {
  const t = useTranslations("Storefront");

  if (products.length === 0) return null;

  return (
    <section className="pb-8">
      <div className="mb-4">
        <h2 className="sm:text-lg font-semibold tracking-tight">
          {t("new_arrivals")}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            shopSlug={shopSlug}
            product={product}
            variant="grid"
            loading={index < 4 ? "eager" : undefined}
            currency={currency}
          />
        ))}
      </div>
    </section>
  );
}
