import { notFound } from "next/navigation";
import { EditPromotionForm } from "@/features/dashboard-promotions/components/forms/edit-promotion-form";
import {
  getPromotionById,
  getPromotionProductOptions,
} from "@/features/dashboard-promotions/data/promotion.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ shop: string; id: string }>;
}) {
  const { shop: slug, id } = await params;
  const shop = await getShopBySlug(slug);
  const [promotion, productOptions] = await Promise.all([
    getPromotionById(id, shop.id),
    getPromotionProductOptions(shop.id),
  ]);

  if (!promotion) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit promotion</h1>
      </div>
      <EditPromotionForm
        promotion={{
          id: promotion.id,
          name: promotion.name,
          slug: promotion.slug,
          description: promotion.description ?? "",
          bannerImage: promotion.bannerImage ?? "",
          discountType: promotion.discountType,
          discountValue: promotion.discountValue.toNumber(), // Serialize Decimal
          code: promotion.code ?? "",
          isActive: promotion.isActive,
          productIds: promotion.products.map((product) => product.id),
        }}
        productOptions={productOptions}
      />
    </div>
  );
}
