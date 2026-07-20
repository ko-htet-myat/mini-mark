import { CreatePromotionForm } from "@/features/promotions/components/create-promotion-form";
import { getShopBySlug } from "@/features/shop/data/get-shop";

export default async function CreatePromotionPage({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop: slug } = await params;
  const shop = await getShopBySlug(slug);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create promotion</h1>
      <CreatePromotionForm shopId={shop.id} />
    </div>
  );
}
