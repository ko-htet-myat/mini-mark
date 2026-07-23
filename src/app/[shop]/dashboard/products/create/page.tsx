import { CreateProductForm } from "@/features/products/components/create-product-form";
import { getShopProductFormData } from "@/features/products/data/product.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";

interface CreateProductPageProps {
  params: Promise<{ shop: string }>;
}

export default async function CreateProductPage({
  params,
}: CreateProductPageProps) {
  const { shop: shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);

  const { categories, brands, attributes, promotions } =
    await getShopProductFormData(shop.id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight">Create Product</h1>
      <CreateProductForm
        shopId={shop.id}
        shopSlug={shop.slug}
        currency={shop.currency}
        categories={categories}
        brands={brands}
        attributes={attributes}
        promotions={promotions}
      />
    </div>
  );
}
