"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadField } from "@/features/cloudinary/image-upload-field";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RegisterFn = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WatchFn = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetValueFn = (...args: any[]) => void;

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
  errors: Errors;
  isPending: boolean;
  serverError?: string;
  categories: CategoryOption[];
  brands: BrandOption[];
  attributes: AttributeOption[];
  promotions: PromotionOption[];
  shopSlug: string;
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
  errors,
  isPending,
  serverError,
  categories,
  brands,
  attributes,
  promotions,
  shopSlug,
  tc,
  tp,
  submitLabel,
  autoSlug,
  onCancel,
}: ProductFormFieldsProps) {
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

  const images = watch("images") ?? [];
  const selectedValues = watch("attributeValues") ?? [];
  const selectedPromotions = watch("promotionIds") ?? [];
  const selectedValueIds = selectedValues.map(
    (v: { attributeValueId: string }) => v.attributeValueId,
  );

  function addImage(url: string) {
    setValue("images", [...images, url], { shouldDirty: true });
  }

  function removeImage(url: string) {
    setValue(
      "images",
      images.filter((img: string) => img !== url),
      { shouldDirty: true },
    );
  }

  function toggleAttributeValue(valId: string) {
    const exists = selectedValueIds.includes(valId);
    const updated = exists
      ? selectedValues.filter(
          (v: { attributeValueId: string }) => v.attributeValueId !== valId,
        )
      : [...selectedValues, { attributeValueId: valId, extraPrice: null }];
    setValue("attributeValues", updated, { shouldDirty: true });
  }

  function setExtraPrice(valId: string, extraPrice: number | null) {
    const updated = selectedValues.map(
      (v: { attributeValueId: string; extraPrice?: number | null }) =>
        v.attributeValueId === valId ? { ...v, extraPrice } : v,
    );
    setValue("attributeValues", updated, { shouldDirty: true });
  }

  function getExtraPrice(valId: string): number | null | undefined {
    return selectedValues.find(
      (v: { attributeValueId: string; extraPrice?: number | null }) =>
        v.attributeValueId === valId,
    )?.extraPrice;
  }

  function togglePromotion(promoId: string) {
    const exists = selectedPromotions.includes(promoId);
    const updated = exists
      ? selectedPromotions.filter((id: string) => id !== promoId)
      : [...selectedPromotions, promoId];
    setValue("promotionIds", updated, { shouldDirty: true });
  }

  const nameErr = errors.name?.message;
  const slugErr = errors.slug?.message;
  const descErr = errors.description?.message;
  const priceErr = errors.price?.message;
  const compareErr = errors.compareAtPrice?.message;
  const skuErr = errors.sku?.message;
  const stockErr = errors.stock?.message;
  const youtubeErr = errors.youtubeUrl?.message;
  const imagesErr = errors.images?.message;

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
                  <Label htmlFor="sku">{tp("sku")}</Label>
                  <Input id="sku" {...register("sku")} />
                  {skuErr && (
                    <p className="text-sm text-destructive">{skuErr}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="stock">{tp("stock")}</Label>
                  <Input
                    id="stock"
                    type="number"
                    step="1"
                    min="0"
                    {...register("stock")}
                  />
                  {stockErr && (
                    <p className="text-sm text-destructive">{stockErr}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="categoryId">{tp("category")}</Label>
                  <Select
                    value={watch("categoryId") || undefined}
                    onValueChange={(value) =>
                      setValue("categoryId", value, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder={tp("select_category")} />
                    </SelectTrigger>
                    <SelectContent>
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
                      setValue("brandId", value, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger id="brandId">
                      <SelectValue placeholder={tp("select_brand")} />
                    </SelectTrigger>
                    <SelectContent>
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
                              : `$${promo.discountValue} OFF`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {attributes.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Product Attributes & Variants
                  </h3>
                  <div className="grid gap-4 border rounded-lg p-4 bg-muted/20">
                    {attributes.map((attr) => (
                      <div key={attr.id} className="flex flex-col gap-2">
                        <span className="text-sm font-medium">{attr.name}</span>
                        <div className="flex flex-wrap gap-2">
                          {attr.values.map((val) => {
                            const isChecked = selectedValueIds.includes(val.id);
                            return (
                              <div key={val.id} className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() => toggleAttributeValue(val.id)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm cursor-pointer transition-colors ${
                                    isChecked
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-background hover:bg-muted"
                                  }`}
                                >
                                  {val.value}
                                </button>
                                {isChecked && (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Extra price"
                                    value={getExtraPrice(val.id) ?? ""}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      setExtraPrice(
                                        val.id,
                                        v === "" ? null : Number(v),
                                      );
                                    }}
                                    className="h-7 w-28 text-xs"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
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
              <Label>{tp("images")}</Label>
              <div className="flex flex-wrap gap-2">
                {images.map((url: string) => (
                  <div key={url} className="relative w-20 h-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <ImageUploadField
                label={tp("add_image")}
                folder={`${shopSlug}/products/images`}
                value=""
                onUploaded={(asset) => addImage(asset.url)}
                onRemoved={() => {}}
              />
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
