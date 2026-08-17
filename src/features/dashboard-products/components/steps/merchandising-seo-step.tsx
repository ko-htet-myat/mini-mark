"use client";

import { useFormContext } from "react-hook-form";
import type { $Enums } from "@/generated/prisma/client";
import type { CreateProductInput } from "../../validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ShopCategoryType = $Enums.ShopCategoryType;

const BEST_SELLER_CATEGORIES: ShopCategoryType[] = [
  "FASHION",
  "BOOKS_STATIONERY",
  "ELECTRONICS",
  "BEAUTY",
];

export function MerchandisingSeoStep({
  shopCategory,
}: {
  shopCategory: ShopCategoryType;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateProductInput>();
  const seoErrors = errors.merchandisingSeo;

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="metaTitle">Meta title</Label>
          <Input
            id="metaTitle"
            placeholder="Falls back to product name"
            {...register("merchandisingSeo.metaTitle")}
          />
          {seoErrors?.metaTitle && (
            <p className="text-sm text-destructive">
              {seoErrors.metaTitle.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="metaDescription">Meta description</Label>
          <Textarea
            id="metaDescription"
            rows={3}
            placeholder="Falls back to product description"
            {...register("merchandisingSeo.metaDescription")}
            className="resize-none"
          />
          {seoErrors?.metaDescription && (
            <p className="text-sm text-destructive">
              {seoErrors.metaDescription.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="noticeText">Notice text</Label>
          <Textarea
            id="noticeText"
            rows={3}
            placeholder="e.g. Preorder item, ships within 3 days"
            {...register("merchandisingSeo.noticeText")}
            className="resize-none"
          />
          {seoErrors?.noticeText && (
            <p className="text-sm text-destructive">
              {seoErrors.noticeText.message}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <ToggleField
          id="isFeatured"
          label="Featured product"
          description="Highlight this product in storefront featured sections."
          checked={watch("merchandisingSeo.isFeatured")}
          onCheckedChange={(checked) =>
            setValue("merchandisingSeo.isFeatured", checked, {
              shouldDirty: true,
            })
          }
        />

        {BEST_SELLER_CATEGORIES.includes(shopCategory) && (
          <ToggleField
            id="isBestSellerItem"
            label="Best seller item"
            description="Show this product in best-seller merchandising areas."
            checked={watch("merchandisingSeo.isBestSellerItem")}
            onCheckedChange={(checked) =>
              setValue("merchandisingSeo.isBestSellerItem", checked, {
                shouldDirty: true,
              })
            }
          />
        )}

        {shopCategory === "FASHION" && (
          <ToggleField
            id="isCollection"
            label="Collection"
            description="Use this product as a collection-style merchandising item."
            checked={watch("merchandisingSeo.isCollection")}
            onCheckedChange={(checked) =>
              setValue("merchandisingSeo.isCollection", checked, {
                shouldDirty: true,
              })
            }
          />
        )}

        {shopCategory === "RESTAURANT" && (
          <ToggleField
            id="isSpecialMenu"
            label="Special menu"
            description="Feature this item in restaurant special menu sections."
            checked={watch("merchandisingSeo.isSpecialMenu")}
            onCheckedChange={(checked) =>
              setValue("merchandisingSeo.isSpecialMenu", checked, {
                shouldDirty: true,
              })
            }
          />
        )}
      </div>
    </section>
  );
}

function ToggleField({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
