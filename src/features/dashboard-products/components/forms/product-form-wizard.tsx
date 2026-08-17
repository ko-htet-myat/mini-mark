"use client";

import { useState } from "react";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { $Enums } from "@/generated/prisma/client";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
} from "../../validations";
import { createProduct, updateProduct } from "../../actions";
import { BaseInfoStep } from "../steps/base-info-step";
import { EngineRouter } from "../steps/engine-router";
import { PricingInventoryStep } from "../steps/pricing-inventory-step";
import { MerchandisingSeoStep } from "../steps/merchandising-seo-step";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Tick02Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";

type ShopCategoryType = $Enums.ShopCategoryType;

const STEP_FIELDS = {
  0: ["basicInfo.name", "basicInfo.slug"] as const,
  1: ["pricingInventory.price", "pricingInventory.maxOrderQuantity"] as const,
  2: ["categoryEngine"] as const,
  3: ["merchandisingSeo"] as const,
};

const STEPS = [
  { label: "Basic info", description: "Name, category, brand & media" },
  { label: "Pricing", description: "Price, units, barcode & order limits" },
  { label: "Variants", description: "Variants, specs, or add-ons" },
  { label: "SEO", description: "Merchandising, visibility & search metadata" },
  { label: "Review", description: "Confirm and publish" },
];

interface ProductFormWizardProps {
  shopId: string;
  shopSlug: string;
  shopCategory: ShopCategoryType;
  categories: { id: string; name: string; parent?: { name: string } | null }[];
  brands: { id: string; name: string }[];
  attributes: {
    id: string;
    name: string;
    values: { id: string; value: string }[];
  }[];
  mode?: "create" | "edit";
  initialData?: Partial<CreateProductInput & { id: string }>;
}

export default function ProductFormWizard({
  shopId,
  shopSlug,
  shopCategory,
  categories,
  brands,
  attributes,
  mode = "create",
  initialData,
}: ProductFormWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const isEdit = mode === "edit";

  const defaultValues: Partial<CreateProductInput & { id?: string }> = {
    shopId,
    basicInfo: {
      name: "",
      slug: "",
      description: "",
      categoryId: "",
      brandId: "",
      imageUrl: "",
      youtubeUrl: "",
    },
    pricingInventory: {
      price: undefined as unknown as number,
      compareAtPrice: undefined,
      costPrice: undefined,
      uom: "PCS",
      barcode: "",
      minOrderQuantity: undefined,
      maxOrderQuantity: undefined,
      isOutOfStock: false,
    },
    categoryEngine: {
      shopCategory,
      hasVariants: false,
      variants: [],
      selectedAttributeIds: [],
      specifications: {},
      addons: [],
    },
    merchandisingSeo: {
      isActive: true,
      isFeatured: false,
      isBestSellerItem: false,
      isCollection: false,
      isSpecialMenu: false,
      noticeText: "",
      metaTitle: "",
      metaDescription: "",
    },
    ...initialData,
  };

  const boundAction = isEdit
    ? updateProduct.bind(null, { shop: shopSlug })
    : createProduct.bind(null, { shop: shopSlug });

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    boundAction as any,
    zodResolver(isEdit ? updateProductSchema : createProductSchema),
    {
      formProps: { defaultValues },
      actionProps: {
        onSuccess: () => {
          toast.success(
            isEdit
              ? "Product updated successfully"
              : "Product created successfully",
          );
          router.push(`/${shopSlug}/dashboard/products`);
        },
        onError: ({ error }) => {
          toast.error(
            typeof error.serverError === "string"
              ? error.serverError
              : "Something went wrong",
          );
        },
      },
    },
  );

  async function handleNext() {
    const fields = STEP_FIELDS[step as keyof typeof STEP_FIELDS];
    if (fields) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const isSubmitting = Boolean(action.isPending);

  return (
    <FormProvider {...form}>
      <div>
        <nav className="mb-8">
          <ol className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const isDone = i < step;
              const isCurrent = i === step;
              return (
                <li
                  key={s.label}
                  className="flex flex-1 items-center last:flex-none"
                >
                  <div className="flex min-w-0 flex-col items-center gap-1">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                        isDone
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCurrent
                            ? "border-primary bg-background text-primary"
                            : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {isDone ? (
                        <HugeiconsIcon icon={Tick02Icon} size={14} />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-center text-xs font-medium leading-tight",
                        isCurrent ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 mb-5 h-0.5 flex-1 transition-colors",
                        isDone ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">{STEPS[step].label}</h2>
            <p className="text-sm text-muted-foreground">
              {STEPS[step].description}
            </p>
          </div>

          {step === 0 && (
            <BaseInfoStep
              shopSlug={shopSlug}
              categories={categories}
              brands={brands}
            />
          )}

          {step === 1 && <PricingInventoryStep />}

          {step === 2 && (
            <EngineRouter shopCategory={shopCategory} attributes={attributes} />
          )}

          {step === 3 && <MerchandisingSeoStep shopCategory={shopCategory} />}

          {step === 4 && (
            <ReviewStep
              form={form}
              categories={categories}
              brands={brands}
              shopCategory={shopCategory}
            />
          )}
        </div>

        {!!action.result.serverError && (
          <p className="mt-4 text-center text-sm text-destructive">
            {String(action.result.serverError)}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={
              step === 0
                ? () => router.push(`/${shopSlug}/dashboard/products`)
                : handleBack
            }
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-2" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                className="ml-2"
              />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleSubmitWithAction()}
            >
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                size={16}
                className="mr-2"
              />
              {isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Update product"
                  : "Save & publish"}
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}

interface ReviewStepProps {
  form: UseFormReturn<CreateProductInput>;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  shopCategory: ShopCategoryType;
}

function ReviewStep({
  form,
  categories,
  brands,
  shopCategory,
}: ReviewStepProps) {
  const values = form.watch();
  const { basicInfo, pricingInventory, categoryEngine, merchandisingSeo } =
    values;
  const isActive = merchandisingSeo.isActive;

  const categoryName =
    categories.find((c) => c.id === basicInfo.categoryId)?.name ?? "-";
  const brandName = brands.find((b) => b.id === basicInfo.brandId)?.name ?? "-";
  const specEntries = Object.entries(categoryEngine.specifications ?? {});
  const addonGroups = categoryEngine.addons ?? [];

  return (
    <div className="space-y-6">
      <ReviewSection title="Basic info">
        <ReviewRow label="Name" value={basicInfo.name} />
        <ReviewRow label="Slug" value={basicInfo.slug} mono />
        <ReviewRow label="Category" value={categoryName} />
        <ReviewRow label="Brand" value={brandName} />
        <ReviewRow label="YouTube URL" value={basicInfo.youtubeUrl ?? ""} />
      </ReviewSection>

      <ReviewSection title="Pricing & inventory">
        <ReviewRow label="Base price" value={String(pricingInventory.price)} />
        <ReviewRow label="UOM" value={pricingInventory.uom} />
        <ReviewRow
          label="Compare-at"
          value={String(pricingInventory.compareAtPrice ?? "-")}
        />
        <ReviewRow
          label="Cost price"
          value={String(pricingInventory.costPrice ?? "-")}
        />
        <ReviewRow label="Barcode" value={pricingInventory.barcode ?? ""} />
        <ReviewRow
          label="Order limits"
          value={`${pricingInventory.minOrderQuantity ?? "none"} / ${
            pricingInventory.maxOrderQuantity ?? "none"
          }`}
        />
        <ReviewRow
          label="Out of stock"
          value={pricingInventory.isOutOfStock ? "Yes" : "No"}
        />
      </ReviewSection>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category engine
        </p>
        <ReviewSection>
          <ReviewRow label="Shop category" value={shopCategory} />
          <ReviewRow
            label="Has variants"
            value={categoryEngine.hasVariants ? "Yes" : "No"}
          />
          <ReviewRow
            label="Variant count"
            value={String(categoryEngine.variants?.length ?? 0)}
          />
        </ReviewSection>

        {specEntries.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {specEntries.map(([k, v]) => (
              <li key={k} className="flex gap-2">
                <span className="font-medium">{k}:</span>
                <span className="text-muted-foreground">{String(v)}</span>
              </li>
            ))}
          </ul>
        )}

        {shopCategory === "RESTAURANT" && addonGroups.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {addonGroups.map((g, i) => (
              <li key={i}>
                <span className="font-medium">{g.groupName}</span>
                <span className="ml-2 text-muted-foreground">
                  {g.options.length} option(s)
                </span>
              </li>
            ))}
          </ul>
        )}

        {categoryEngine.hasVariants && (
          <ul className="mt-3 space-y-1 text-sm">
            {(categoryEngine.variants ?? []).slice(0, 5).map((v, i) => (
              <li key={i} className="text-muted-foreground">
                {v.sku || `Variant #${i + 1}`}
                {v.price ? ` - ${v.price}` : ""}
                {` - stock: ${v.stock ?? 0}`}
              </li>
            ))}
            {(categoryEngine.variants?.length ?? 0) > 5 && (
              <li className="text-muted-foreground">
                ...and {(categoryEngine.variants?.length ?? 0) - 5} more
              </li>
            )}
          </ul>
        )}
      </div>

      <ReviewSection title="Merchandising & SEO">
        <ReviewRow
          label="Featured"
          value={merchandisingSeo.isFeatured ? "Yes" : "No"}
        />
        <ReviewRow
          label="Best seller"
          value={merchandisingSeo.isBestSellerItem ? "Yes" : "No"}
        />
        <ReviewRow
          label="Collection"
          value={merchandisingSeo.isCollection ? "Yes" : "No"}
        />
        <ReviewRow
          label="Special menu"
          value={merchandisingSeo.isSpecialMenu ? "Yes" : "No"}
        />
        <ReviewRow label="Notice" value={merchandisingSeo.noticeText ?? ""} />
        <ReviewRow
          label="Meta title"
          value={merchandisingSeo.metaTitle || basicInfo.name}
        />
        <ReviewRow
          label="Meta description"
          value={
            merchandisingSeo.metaDescription || basicInfo.description || ""
          }
        />
      </ReviewSection>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="isActive" className="text-sm font-medium">
            Publish product
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Active products are visible in your storefront.
          </p>
        </div>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) =>
            form.setValue("merchandisingSeo.isActive", checked, {
              shouldDirty: true,
            })
          }
        />
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {title && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("truncate font-medium", mono && "font-mono text-xs")}>
        {value || "-"}
      </span>
    </div>
  );
}
