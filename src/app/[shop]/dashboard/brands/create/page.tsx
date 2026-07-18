import { CreateBrandForm } from "@/features/brands/components/create-brand-form";
import { getShopBySlug } from "@/features/shop/data/get-shop";

export default async function CreateBrandPage({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop: slug } = await params;
  const shop = await getShopBySlug(slug);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create brand</h1>
      <CreateBrandForm shopId={shop.id} />
    </div>
  );
}
