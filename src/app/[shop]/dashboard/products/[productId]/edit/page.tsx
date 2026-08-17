import { notFound } from "next/navigation";
import ProductFormWizard from "@/features/dashboard-products/components/forms/product-form-wizard";
import type { CreateProductInput } from "@/features/dashboard-products/validations";
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
    basicInfo: {
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      categoryId: product.categoryId ?? "",
      brandId: product.brandId ?? "",
      imageUrl: product.imageUrl ?? "",
      youtubeUrl: product.youtubeUrl ?? "",
    },
    pricingInventory: {
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? undefined,
      costPrice: product.costPrice ?? undefined,
      uom: product.uom,
      barcode: product.barcode ?? "",
      minOrderQuantity: product.minOrderQuantity ?? undefined,
      maxOrderQuantity: product.maxOrderQuantity ?? undefined,
      isOutOfStock: product.isOutOfStock,
    },
    categoryEngine: {
      shopCategory: shop.shopCategory,
      hasVariants: product.hasVariants,
      selectedAttributeIds: [],
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
        costPrice: v.costPrice ?? undefined,
        stock: v.stock,
        imageUrl: v.imageUrl ?? "",
        allowBackorder: v.allowBackorder,
        uom: (v.uom ??
          "") as CreateProductInput["categoryEngine"]["variants"][number]["uom"],
        uomValue: v.uomValue ?? undefined,
        isActive: v.isActive,
        attributeValueIds: v.attributeValues.map((av) => av.attributeValueId),
      })),
    },
    merchandisingSeo: {
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isBestSellerItem: product.isBestSellerItem,
      isCollection: product.isCollection,
      isSpecialMenu: product.isSpecialMenu,
      noticeText: product.noticeText ?? "",
      metaTitle: product.metaTitle ?? "",
      metaDescription: product.metaDescription ?? "",
    },
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
