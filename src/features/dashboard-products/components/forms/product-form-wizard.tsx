"use client";

import { useState } from "react";
import { FormProvider } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Tick02Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";

type ShopCategoryType = $Enums.ShopCategoryType;

// Fields validated at Step 1 before advancing
const STEP1_FIELDS: (keyof CreateProductInput)[] = ["name", "slug", "price"];

const STEPS = [
  { label: "Base Info", description: "Name, price, category & media" },
  { label: "Product Details", description: "Variants, specs, or add-ons" },
  { label: "Review & Save", description: "Confirm and publish" },
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

  // Shared default values
  const defaultValues: Partial<CreateProductInput & { id?: string }> = {
    shopId,
    name: "",
    slug: "",
    description: "",
    price: undefined as unknown as number,
    compareAtPrice: undefined as unknown as number,
    imageUrl: "",
    youtubeUrl: "",
    isActive: true,
    categoryId: "",
    brandId: "",
    hasVariants: false,
    variants: [],
    specifications: {},
    addons: [],
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
    if (step === 0) {
      const valid = await form.trigger(STEP1_FIELDS);
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
      <form onSubmit={handleSubmitWithAction} className="max-w-3xl mx-auto">
        {/* ── Step indicator ─────────────────────────────────────────── */}
        <nav className="mb-8">
          <ol className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const isDone = i < step;
              const isCurrent = i === step;
              return (
                <li
                  key={s.label}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center gap-1 min-w-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors",
                        isDone
                          ? "bg-primary border-primary text-primary-foreground"
                          : isCurrent
                            ? "border-primary text-primary bg-background"
                            : "border-border text-muted-foreground bg-background",
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
                        "text-xs font-medium text-center leading-tight",
                        isCurrent ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2 mb-5 transition-colors",
                        isDone ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* ── Step content ───────────────────────────────────────────── */}
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

          {step === 1 && (
            <div className="space-y-6">
              <EngineRouter
                shopCategory={shopCategory}
                attributes={attributes}
              />
            </div>
          )}

          {step === 2 && (
            <ReviewStep
              form={form}
              categories={categories}
              brands={brands}
              shopCategory={shopCategory}
            />
          )}
        </div>

        {/* ── Server error ───────────────────────────────────────────── */}
        {!!action.result.serverError && (
          <p className="mt-4 text-sm text-destructive text-center">
            {String(action.result.serverError)}
          </p>
        )}

        {/* ── Navigation ─────────────────────────────────────────────── */}
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
            <Button type="submit" disabled={isSubmitting}>
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                size={16}
                className="mr-2"
              />
              {isSubmitting
                ? "Saving…"
                : isEdit
                  ? "Update product"
                  : "Save & publish"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

// ─── Review step ──────────────────────────────────────────────────────────────

interface ReviewStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
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
  const values = form.watch() as CreateProductInput & { id?: string };
  const isActive = values.isActive;

  const categoryName =
    categories.find((c) => c.id === values.categoryId)?.name ?? "—";
  const brandName = brands.find((b) => b.id === values.brandId)?.name ?? "—";

  const specEntries = Object.entries(values.specifications ?? {});
  const addonGroups = values.addons ?? [];

  return (
    <div className="space-y-6">
      {/* Basic info summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <ReviewRow label="Name" value={values.name} />
        <ReviewRow label="Slug" value={values.slug} mono />
        <ReviewRow
          label="Base price"
          value={values.price ? String(values.price) : "—"}
        />
        {values.compareAtPrice && (
          <ReviewRow label="Compare-at" value={String(values.compareAtPrice)} />
        )}
        <ReviewRow label="Category" value={categoryName} />
        <ReviewRow label="Brand" value={brandName} />
        {values.youtubeUrl && (
          <ReviewRow label="YouTube URL" value={values.youtubeUrl} />
        )}
      </div>

      {/* Specifications */}
      {specEntries.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Specifications
          </p>
          <ul className="space-y-1 text-sm">
            {specEntries.map(([k, v]) => (
              <li key={k} className="flex gap-2">
                <span className="font-medium">{k}:</span>
                <span className="text-muted-foreground">{String(v)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add-ons summary */}
      {shopCategory === "RESTAURANT" && addonGroups.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Add-on groups ({addonGroups.length})
          </p>
          <ul className="space-y-1 text-sm">
            {addonGroups.map(
              (
                g: { groupName: string; options: { name: string }[] },
                i: number,
              ) => (
                <li key={i}>
                  <span className="font-medium">{g.groupName}</span>
                  <span className="text-muted-foreground ml-2">
                    {g.options.length} option(s)
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {/* Variants summary */}
      {values.hasVariants && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Variants ({values.variants?.length ?? 0})
          </p>
          {(values.variants?.length ?? 0) === 0 ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              ⚠ No variants generated. Go back to Step 2 to generate the variant
              matrix.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {(values.variants ?? []).slice(0, 5).map((v, i) => (
                <li key={i} className="text-muted-foreground">
                  {v.sku || `Variant #${i + 1}`}
                  {v.price ? ` — ${v.price}` : ""}
                  {` — stock: ${v.stock ?? 0}`}
                </li>
              ))}
              {(values.variants?.length ?? 0) > 5 && (
                <li className="text-muted-foreground">
                  …and {(values.variants?.length ?? 0) - 5} more
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="isActive" className="text-sm font-medium">
            Publish product
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active products are visible in your storefront.
          </p>
        </div>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) =>
            form.setValue("isActive", checked, { shouldDirty: true })
          }
        />
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
      <span className={cn("font-medium truncate", mono && "font-mono text-xs")}>
        {value || "—"}
      </span>
    </div>
  );
}
