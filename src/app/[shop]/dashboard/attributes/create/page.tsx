import { CreateAttributeForm } from "@/features/attributes/components/create-attribute-form";
import { getShopBySlug } from "@/features/shop/data/get-shop";

export default async function CreateAttributePage({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop: slug } = await params;
  const shop = await getShopBySlug(slug);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create attribute</h1>
      <CreateAttributeForm shopId={shop.id} />
    </div>
  );
}
