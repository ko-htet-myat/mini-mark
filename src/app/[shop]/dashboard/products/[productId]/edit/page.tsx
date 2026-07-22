import { notFound } from "next/navigation";
import { EditProductForm } from "@/features/products/components/edit-product-form";
import {
  getProductById,
  getShopProductFormData,
} from "@/features/products/data/product.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";

interface EditProductPageProps {
  params: Promise<{ shop: string; productId: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { shop: shopSlug, productId } = await params;
  const shop = await getShopBySlug(shopSlug);

  const [product, { categories, brands, attributes, promotions }] =
    await Promise.all([
      getProductById(productId, shop.id),
      getShopProductFormData(shop.id),
    ]);

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    sku: product.sku,
    stock: product.stock,
    status: product.status,
    images: product.images,
    youtubeUrl: product.youtubeUrl,
    isActive: product.isActive,
    categoryId: product.categoryId,
    brandId: product.brandId,
    attributeValues: product.attributeValues.map((av) => ({
      attributeValueId: av.attributeValue.id,
      extraPrice: av.extraPrice ? Number(av.extraPrice) : null,
    })),
    promotionIds: product.promotions.map((p) => p.id),
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
      <EditProductForm
        shopId={shop.id}
        categories={categories}
        brands={brands}
        attributes={attributes}
        promotions={promotions}
        initialData={initialData}
      />
    </div>
  );
}
