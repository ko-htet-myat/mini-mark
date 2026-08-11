import ProductFormWizard from "@/features/dashboard-products/components/forms/product-form-wizard";
import { getShopProductFormData } from "@/features/dashboard-products/data/product.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";

interface CreateProductPageProps {
  params: Promise<{ shop: string }>;
}

export default async function CreateProductPage({
  params,
}: CreateProductPageProps) {
  const { shop: shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);

  const { categories, brands, attributes } = await getShopProductFormData(
    shop.id,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Product</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details step by step to add a new product to your store.
        </p>
      </div>
      <ProductFormWizard
        shopId={shop.id}
        shopSlug={shop.slug}
        shopCategory={shop.shopCategory}
        categories={categories}
        brands={brands}
        attributes={attributes}
        mode="create"
      />
    </div>
  );
}
