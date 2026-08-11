import { notFound } from "next/navigation";
import ProductFormWizard from "@/features/dashboard-products/components/forms/product-form-wizard";
import {
  getProductById,
  getShopProductFormData,
} from "@/features/dashboard-products/data/product.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";

interface EditProductPageProps {
  params: Promise<{ shop: string; productId: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { shop: shopSlug, productId } = await params;
  const shop = await getShopBySlug(shopSlug);

  const [product, { categories, brands, attributes }] = await Promise.all([
    getProductById(productId, shop.id),
    getShopProductFormData(shop.id),
  ]);

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    shopId: shop.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    costPrice: product.costPrice ?? undefined,
    imageUrl: product.imageUrl ?? "",
    youtubeUrl: product.youtubeUrl ?? "",
    noticeText: product.noticeText ?? "",
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    hasVariants: product.hasVariants,
    categoryId: product.categoryId ?? "",
    brandId: product.brandId ?? "",
    // Pre-populate specs and addons from DB
    specifications:
      (product.specifications as Record<string, string> | null) ?? {},
    addons:
      (product.addons as
        | {
            groupName: string;
            minSelect: number;
            maxSelect: number;
            options: { name: string; price: number }[];
          }[]
        | null) ?? [],
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku ?? "",
      price: v.price ?? undefined,
      compareAtPrice: v.compareAtPrice ?? undefined,
      stock: v.stock,
      imageUrl: v.imageUrl ?? "",
      isActive: v.isActive,
      attributeValues: v.attributeValues.map((av) => ({
        attributeValueId: av.attributeValueId,
      })),
    })),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update the details for{" "}
          <span className="font-medium">{product.name}</span>.
        </p>
      </div>
      <ProductFormWizard
        shopId={shop.id}
        shopSlug={shop.slug}
        shopCategory={shop.shopCategory}
        categories={categories}
        brands={brands}
        attributes={attributes}
        mode="edit"
        initialData={initialData}
      />
    </div>
  );
}
