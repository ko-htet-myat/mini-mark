"use client";

import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadField } from "@/features/cloudinary/image-upload-field";
import { formatAmount } from "@/lib/format";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Edit02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RegisterFn = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WatchFn = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetValueFn = (...args: any[]) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Control = any;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Errors = Record<string, any>;

export interface ProductFormFieldsProps {
  register: RegisterFn;
  watch: WatchFn;
  setValue: SetValueFn;
  control: Control;
  errors: Errors;
  isPending: boolean;
  serverError?: string;
  categories: CategoryOption[];
  brands: BrandOption[];
  attributes: AttributeOption[];
  promotions: PromotionOption[];
  shopSlug: string;
  currency: string;
  tc: (key: string, values?: Record<string, unknown>) => string;
  tp: (key: string, values?: Record<string, unknown>) => string;
  submitLabel: string;
  autoSlug?: boolean;
  onCancel: () => void;
}

export function ProductFormFields({
  register,
  watch,
  setValue,
  control,
  errors,
  isPending,
  serverError,
  categories,
  brands,
  attributes,
  promotions,
  shopSlug,
  currency,
  tc,
  tp,
  submitLabel,
  autoSlug,
  onCancel,
}: ProductFormFieldsProps) {
  const hasVariants = watch("hasVariants");

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!autoSlug) return;
    setValue(
      "slug",
      e.target.value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    );
  }

  const imageUrl = watch("imageUrl") ?? "";
  const selectedPromotions = watch("promotionIds") ?? [];

  function setImage(url: string) {
    setValue("imageUrl", url || "", { shouldDirty: true });
  }

  function removeImage() {
    setValue("imageUrl", "", { shouldDirty: true });
  }

  function togglePromotion(promoId: string) {
    const exists = selectedPromotions.includes(promoId);
    const updated = exists
      ? selectedPromotions.filter((id: string) => id !== promoId)
      : [...selectedPromotions, promoId];
    setValue("promotionIds", updated, { shouldDirty: true });
  }

  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(
    null,
  );
  const [variantForm, setVariantForm] = useState({
    sku: "",
    price: "" as string | number,
    compareAtPrice: "" as string | number,
    stock: 0,
    imageUrl: "",
    isActive: true,
    attributeValues: [] as { attributeValueId: string }[],
  });

  function resetVariantForm() {
    setVariantForm({
      sku: "",
      price: "",
      compareAtPrice: "",
      stock: 0,
      imageUrl: "",
      isActive: true,
      attributeValues: [],
    });
  }

  function openAddVariantDialog() {
    resetVariantForm();
    setEditingVariantIndex(null);
    setVariantDialogOpen(true);
  }

  function openEditVariantDialog(index: number) {
    const v = watch(`variants.${index}`) as
      | {
          sku?: string | null;
          price?: number | null;
          compareAtPrice?: number | null;
          stock?: number;
          imageUrl?: string | null;
          isActive?: boolean;
          attributeValues?: { attributeValueId: string }[];
        }
      | undefined;
    setVariantForm({
      sku: v?.sku ?? "",
      price: v?.price ?? "",
      compareAtPrice: v?.compareAtPrice ?? "",
      stock: v?.stock ?? 0,
      imageUrl: v?.imageUrl ?? "",
      isActive: v?.isActive ?? true,
      attributeValues: v?.attributeValues ?? [],
    });
    setEditingVariantIndex(index);
    setVariantDialogOpen(true);
  }

  function saveVariantFromDialog() {
    const data = {
      sku: variantForm.sku,
      price: variantForm.price === "" ? null : Number(variantForm.price),
      compareAtPrice:
        variantForm.compareAtPrice === ""
          ? null
          : Number(variantForm.compareAtPrice),
      stock: variantForm.stock,
      imageUrl: variantForm.imageUrl || "",
      isActive: variantForm.isActive,
      attributeValues: variantForm.attributeValues,
    };

    if (editingVariantIndex !== null) {
      setValue(`variants.${editingVariantIndex}`, data, { shouldDirty: true });
    } else {
      appendVariant(data);
    }
    setVariantDialogOpen(false);
  }

  function toggleVariantAttributeValue(valId: string) {
    const exists = variantForm.attributeValues.some(
      (v) => v.attributeValueId === valId,
    );
    setVariantForm((prev) => ({
      ...prev,
      attributeValues: exists
        ? prev.attributeValues.filter((v) => v.attributeValueId !== valId)
        : [...prev.attributeValues, { attributeValueId: valId }],
    }));
  }

  const nameErr = errors.name?.message;
  const slugErr = errors.slug?.message;
  const descErr = errors.description?.message;
  const priceErr = errors.price?.message;
  const compareErr = errors.compareAtPrice?.message;
  const youtubeErr = errors.youtubeUrl?.message;
  const imagesErr = errors.imageUrl?.message;

  return (
    <>
      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="advance">Advance</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="flex flex-col gap-5 pt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">{tc("name")}</Label>
                <Input
                  id="name"
                  {...register("name", { onChange: handleNameChange })}
                />
                {nameErr && (
                  <p className="text-sm text-destructive">{nameErr}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">{tc("slug")}</Label>
                <Input id="slug" {...register("slug")} />
                {slugErr && (
                  <p className="text-sm text-destructive">{slugErr}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">{tc("description")}</Label>
                <Textarea
                  id="description"
                  rows={4}
                  {...register("description")}
                />
                {descErr && (
                  <p className="text-sm text-destructive">{descErr}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="price">{tp("price")}</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("price")}
                  />
                  {priceErr && (
                    <p className="text-sm text-destructive">{priceErr}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="compareAtPrice">
                    {tp("compare_at_price")}
                  </Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("compareAtPrice")}
                  />
                  {compareErr && (
                    <p className="text-sm text-destructive">{compareErr}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="categoryId">{tp("category")}</Label>
                  <Select
                    value={watch("categoryId") || undefined}
                    onValueChange={(value) =>
                      setValue(
                        "categoryId",
                        value === "__none__" ? "" : value,
                        { shouldDirty: true },
                      )
                    }
                  >
                    <SelectTrigger id="categoryId" className="w-full">
                      <SelectValue placeholder={tp("select_category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{tp("none")}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.parent ? `${category.parent.name} > ` : ""}
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="brandId">{tp("brand")}</Label>
                  <Select
                    value={watch("brandId") || undefined}
                    onValueChange={(value) =>
                      setValue("brandId", value === "__none__" ? "" : value, {
                        shouldDirty: true,
                      })
                    }
                  >
                    <SelectTrigger id="brandId" className="w-full">
                      <SelectValue placeholder={tp("select_brand")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{tp("none")}</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advance" className="flex flex-col gap-6 pt-4">
              {promotions.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Promotions & Discounts
                  </h3>
                  <div className="grid gap-3 border rounded-lg p-4 bg-muted/20">
                    {promotions.map((promo) => {
                      const isChecked = selectedPromotions.includes(promo.id);
                      return (
                        <div
                          key={promo.id}
                          className="flex items-center justify-between gap-4 p-2 rounded border bg-background"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`promo-${promo.id}`}
                              checked={isChecked}
                              onCheckedChange={() => togglePromotion(promo.id)}
                            />
                            <Label
                              htmlFor={`promo-${promo.id}`}
                              className="cursor-pointer font-medium"
                            >
                              {promo.name}
                            </Label>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {promo.discountType === "PERCENTAGE"
                              ? `${promo.discountValue}% OFF`
                              : `${formatAmount(Number(promo.discountValue), currency)} OFF`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="hasVariants">{tp("has_variants")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {tp("has_variants_description")}
                  </p>
                </div>
                <Switch
                  id="hasVariants"
                  checked={hasVariants}
                  onCheckedChange={(checked) =>
                    setValue("hasVariants", checked, { shouldDirty: true })
                  }
                />
              </section>

              {hasVariants && (
                <section className="flex flex-col gap-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {tp("variants")}
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openAddVariantDialog}
                    >
                      <HugeiconsIcon
                        icon={Add01Icon}
                        className="mr-1 h-3.5 w-3.5"
                      />
                      {tp("add_variant")}
                    </Button>
                  </div>

                  {variantFields.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {tp("no_variants")}
                    </p>
                  )}

                  {variantFields.map((field, index) => {
                    const v = watch(`variants.${index}`) as
                      | {
                          sku?: string | null;
                          price?: number | null;
                          stock?: number;
                          attributeValues?: { attributeValueId: string }[];
                        }
                      | undefined;
                    const attrValues = v?.attributeValues ?? [];
                    const attrLabels = attrValues
                      .map((av: { attributeValueId: string }) => {
                        for (const attr of attributes) {
                          const found = attr.values.find(
                            (val) => val.id === av.attributeValueId,
                          );
                          if (found) return found.value;
                        }
                        return null;
                      })
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <div
                        key={field.id}
                        className="flex items-center justify-between gap-3 rounded-md border p-3 bg-muted/10"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {attrLabels || `${tp("variant")} #${index + 1}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {v?.sku ? `SKU: ${v.sku}` : ""}
                            {v?.sku && (v?.price || v?.stock) ? " | " : ""}
                            {v?.price
                              ? `Price: ${formatAmount(Number(v.price), currency)}`
                              : ""}
                            {v?.price && v?.stock ? " | " : ""}
                            {v?.stock !== undefined ? `Stock: ${v.stock}` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditVariantDialog(index)}
                          >
                            <HugeiconsIcon
                              icon={Edit02Icon}
                              className="h-3.5 w-3.5"
                            />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeVariant(index)}
                          >
                            <HugeiconsIcon
                              icon={Cancel01Icon}
                              className="h-3.5 w-3.5"
                            />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {errors.variants && (
                    <p className="text-sm text-destructive">
                      {errors.variants.message?.toString()}
                    </p>
                  )}
                </section>
              )}

              <Dialog
                open={variantDialogOpen}
                onOpenChange={setVariantDialogOpen}
              >
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingVariantIndex !== null
                        ? tp("edit_variant")
                        : tp("add_variant")}
                    </DialogTitle>
                    <DialogDescription>
                      {tp("variant_dialog_description")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">{tp("sku")}</Label>
                        <Input
                          value={variantForm.sku}
                          onChange={(e) =>
                            setVariantForm((prev) => ({
                              ...prev,
                              sku: e.target.value,
                            }))
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">{tp("stock")}</Label>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          value={variantForm.stock}
                          onChange={(e) =>
                            setVariantForm((prev) => ({
                              ...prev,
                              stock: Number(e.target.value),
                            }))
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">
                          {tp("price")} ({tp("optional")})
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variantForm.price}
                          onChange={(e) =>
                            setVariantForm((prev) => ({
                              ...prev,
                              price: e.target.value,
                            }))
                          }
                          className="h-8 text-sm"
                          placeholder={tp("inherits_product_price")}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">
                          {tp("compare_at_price")}
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variantForm.compareAtPrice}
                          onChange={(e) =>
                            setVariantForm((prev) => ({
                              ...prev,
                              compareAtPrice: e.target.value,
                            }))
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">{tp("variant_image")}</Label>
                      <ImageUploadField
                        label={tp("add_image")}
                        folder={`${shopSlug}/products/variants`}
                        value={variantForm.imageUrl}
                        onUploaded={(asset) =>
                          setVariantForm((prev) => ({
                            ...prev,
                            imageUrl: asset.url,
                          }))
                        }
                        onRemoved={() =>
                          setVariantForm((prev) => ({
                            ...prev,
                            imageUrl: "",
                          }))
                        }
                      />
                    </div>

                    {attributes.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs">{tp("attributes")}</Label>
                        {attributes.map((attr) => (
                          <div key={attr.id} className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">
                              {attr.name}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {attr.values.map((val) => {
                                const isChecked =
                                  variantForm.attributeValues.some(
                                    (av) => av.attributeValueId === val.id,
                                  );
                                return (
                                  <button
                                    key={val.id}
                                    type="button"
                                    onClick={() =>
                                      toggleVariantAttributeValue(val.id)
                                    }
                                    className={`px-2 py-1 rounded border text-xs cursor-pointer transition-colors ${
                                      isChecked
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background hover:bg-muted"
                                    }`}
                                  >
                                    {val.value}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        {tc("cancel")}
                      </Button>
                    </DialogClose>
                    <Button type="button" onClick={saveVariantFromDialog}>
                      {editingVariantIndex !== null
                        ? tp("save_changes")
                        : tp("add_variant")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {tp("section_media")}
            </h3>
            <div className="flex flex-col gap-3">
              <Label>{tc("image")}</Label>
              {imageUrl ? (
                <div className="relative w-full aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <ImageUploadField
                  label={tp("add_image")}
                  folder={`${shopSlug}/products/images`}
                  value=""
                  onUploaded={(asset) => setImage(asset.url)}
                  onRemoved={() => {}}
                />
              )}
              {imagesErr && (
                <p className="text-sm text-destructive">
                  {tp("images_invalid")}
                </p>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {tp("youtube_url")}
            </h3>
            <Input id="youtubeUrl" {...register("youtubeUrl")} />
            {youtubeErr && (
              <p className="text-sm text-destructive">{youtubeErr}</p>
            )}
          </section>

          <section className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="isActive">{tp("is_active")}</Label>
              <p className="text-sm text-muted-foreground">
                {tp("is_active_description")}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) =>
                setValue("isActive", checked, { shouldDirty: true })
              }
            />
          </section>
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-destructive mt-6">{serverError}</p>
      )}

      <div className="flex gap-4 mt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? tc("saving") : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </>
  );
}
