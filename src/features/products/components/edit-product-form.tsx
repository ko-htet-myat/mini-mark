"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { updateProductSchema } from "../validations";
import { updateProduct } from "../actions";
import { ProductFormFields } from "./product-form-fields";

interface CategoryOption {
  id: string;
  name: string;
  parent?: { name: string } | null;
}

interface BrandOption {
  id: string;
  name: string;
}

interface AttributeValueOption {
  id: string;
  value: string;
}

interface AttributeOption {
  id: string;
  name: string;
  values: AttributeValueOption[];
}

interface PromotionOption {
  id: string;
  name: string;
  discountType: string;
  discountValue: number | string | { toString(): string };
}

interface ProductVariantInitialValues {
  id?: string;
  sku?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  attributeValues?: {
    attributeValueId: string;
    attributeValue: {
      id: string;
      value: string;
      attribute: { id: string; name: string };
    };
  }[];
}

interface ProductInitialValues {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  youtubeUrl?: string | null;
  isActive: boolean;
  hasVariants: boolean;
  categoryId?: string | null;
  brandId?: string | null;
  variants?: ProductVariantInitialValues[];
  promotionIds?: string[];
}

interface EditProductFormProps {
  shopId: string;
  shopSlug: string;
  currency: string;
  categories: CategoryOption[];
  brands: BrandOption[];
  attributes: AttributeOption[];
  promotions: PromotionOption[];
  initialData: ProductInitialValues;
}

export function EditProductForm({
  shopId,
  shopSlug,
  currency,
  categories,
  brands,
  attributes,
  promotions,
  initialData,
}: EditProductFormProps) {
  const router = useRouter();
  const tc = useTranslations("Common");
  const tp = useTranslations("Products");

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    updateProduct.bind(null, { shop: shopSlug }),
    zodResolver(updateProductSchema),
    {
      formProps: {
        defaultValues: {
          id: initialData.id,
          shopId,
          name: initialData.name ?? "",
          slug: initialData.slug ?? "",
          description: initialData.description ?? "",
          price: initialData.price ?? (undefined as unknown as number),
          compareAtPrice:
            initialData.compareAtPrice ?? (undefined as unknown as number),
          imageUrl: initialData.imageUrl ?? "",
          youtubeUrl: initialData.youtubeUrl ?? "",
          isActive: initialData.isActive ?? true,
          hasVariants: initialData.hasVariants ?? false,
          categoryId: initialData.categoryId ?? "",
          brandId: initialData.brandId ?? "",
          variants:
            initialData.variants?.map((v) => ({
              id: v.id,
              sku: v.sku ?? "",
              price: v.price ?? null,
              compareAtPrice: v.compareAtPrice ?? null,
              stock: v.stock ?? 0,
              imageUrl: v.imageUrl ?? "",
              isActive: v.isActive ?? true,
              attributeValues:
                v.attributeValues?.map((av) => ({
                  attributeValueId: av.attributeValueId,
                })) ?? [],
            })) ?? [],
          promotionIds: initialData.promotionIds ?? [],
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success(tp("product_updated"));
          router.push(`/${shopSlug}/dashboard/products`);
        },
      },
    },
  );

  return (
    <form onSubmit={handleSubmitWithAction}>
      <ProductFormFields
        register={form.register}
        watch={form.watch}
        setValue={form.setValue}
        control={form.control}
        errors={form.formState.errors}
        isPending={action.isPending}
        serverError={action.result.serverError}
        categories={categories}
        brands={brands}
        attributes={attributes}
        promotions={promotions}
        shopSlug={shopSlug}
        currency={currency}
        tc={tc as (key: string, values?: Record<string, unknown>) => string}
        tp={tp as (key: string, values?: Record<string, unknown>) => string}
        submitLabel="Update Product"
        onCancel={() => router.push(`/${shopSlug}/dashboard/products`)}
      />
    </form>
  );
}
