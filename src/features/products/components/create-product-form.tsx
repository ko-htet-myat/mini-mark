"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { createProductSchema } from "../validations";
import { createProduct } from "../actions";
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

interface CreateProductFormProps {
  shopId: string;
  categories: CategoryOption[];
  brands: BrandOption[];
  attributes: AttributeOption[];
  promotions: PromotionOption[];
}

export function CreateProductForm({
  shopId,
  categories,
  brands,
  attributes,
  promotions,
}: CreateProductFormProps) {
  const router = useRouter();
  const { slug } = useShop();
  const tc = useTranslations("Common");
  const tp = useTranslations("Products");

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    createProduct.bind(null, { shop: slug }),
    zodResolver(createProductSchema),
    {
      formProps: {
        defaultValues: {
          shopId,
          name: "",
          slug: "",
          description: "",
          price: undefined as unknown as number,
          compareAtPrice: undefined as unknown as number,
          sku: "",
          stock: 0,
          status: "IN_STOCK",
          images: [],
          youtubeUrl: "",
          isActive: true,
          categoryId: "",
          brandId: "",
          attributeValues: [],
          promotionIds: [],
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success(tp("product_created"));
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
        submitLabel={tp("create_product")}
        autoSlug
        onCancel={() => router.push(`/${slug}/dashboard/products`)}
      />
    </form>
  );
}
