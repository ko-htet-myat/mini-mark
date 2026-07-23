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
    imageUrl: product.imageUrl,
    youtubeUrl: product.youtubeUrl,
    isActive: product.isActive,
    hasVariants: product.hasVariants,
    categoryId: product.categoryId,
    brandId: product.brandId,
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stock: v.stock,
      imageUrl: v.imageUrl,
      isActive: v.isActive,
      attributeValues: v.attributeValues.map((av) => ({
        attributeValueId: av.attributeValueId,
        attributeValue: av.attributeValue,
      })),
    })),
    promotionIds: product.promotions.map((p) => p.id),
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
      <EditProductForm
        shopId={shop.id}
        shopSlug={shop.slug}
        currency={shop.currency}
        categories={categories}
        brands={brands}
        attributes={attributes}
        promotions={promotions}
        initialData={initialData}
      />
    </div>
  );
}
