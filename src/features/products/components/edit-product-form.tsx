"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { updateProductSchema } from "../validations";
import { updateProduct } from "../actions";
import { useShop } from "@/context/shop-context";
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

interface ProductInitialValues {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  stock: number;
  status: "IN_STOCK" | "OUT_OF_STOCK";
  images: string[];
  youtubeUrl?: string | null;
  isActive: boolean;
  categoryId?: string | null;
  brandId?: string | null;
  attributeValues?: { attributeValueId: string; extraPrice?: number | null }[];
  promotionIds?: string[];
}

interface EditProductFormProps {
  shopId: string;
  categories: CategoryOption[];
  brands: BrandOption[];
  attributes: AttributeOption[];
  promotions: PromotionOption[];
  initialData: ProductInitialValues;
}

export function EditProductForm({
  shopId,
  categories,
  brands,
  attributes,
  promotions,
  initialData,
}: EditProductFormProps) {
  const router = useRouter();
  const { slug } = useShop();
  const tc = useTranslations("Common");
  const tp = useTranslations("Products");

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    updateProduct.bind(null, { shop: slug }),
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
          sku: initialData.sku ?? "",
          stock: initialData.stock ?? 0,
          status: initialData.status ?? "IN_STOCK",
          images: initialData.images ?? [],
          youtubeUrl: initialData.youtubeUrl ?? "",
          isActive: initialData.isActive ?? true,
          categoryId: initialData.categoryId ?? "",
          brandId: initialData.brandId ?? "",
          attributeValues:
            initialData.attributeValues?.map((av) => ({
              attributeValueId: av.attributeValueId,
              extraPrice: av.extraPrice ?? null,
            })) ?? [],
          promotionIds: initialData.promotionIds ?? [],
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success(tp("product_updated"));
          router.push(`/${slug}/dashboard/products`);
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
        errors={form.formState.errors}
        isPending={action.isPending}
        serverError={action.result.serverError}
        categories={categories}
        brands={brands}
        attributes={attributes}
        promotions={promotions}
        shopSlug={slug}
        tc={tc as (key: string, values?: Record<string, unknown>) => string}
        tp={tp as (key: string, values?: Record<string, unknown>) => string}
        submitLabel="Update Product"
        onCancel={() => router.push(`/${slug}/dashboard/products`)}
      />
    </form>
  );
}
