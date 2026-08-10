"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/features/cloudinary/image-upload-field";
import type { SettingsFormApi } from "@/features/settings/components/settings-tab-types";
import { Currency, ShopCategoryType } from "@/generated/prisma/enums";
import { useTranslations } from "next-intl";

const SHOP_CATEGORIES = Object.values(ShopCategoryType);
const CURRENCIES = Object.values(Currency);

type GeneralSettingsTabProps = {
  form: SettingsFormApi;
  shopSlug: string;
};

export function GeneralSettingsTab({
  form,
  shopSlug,
}: GeneralSettingsTabProps) {
  const ts = useTranslations("Settings");
  const tc = useTranslations("Common");

  return (
    <div className="flex flex-col gap-6 border rounded-xl p-6 bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{ts("shop_name")}</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">{ts("currency")}</Label>
          <Select
            value={form.watch("currency")}
            onValueChange={(value) =>
              form.setValue("currency", value as Currency, {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger id="currency" className="w-full">
              <SelectValue placeholder={ts("currency")} />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="shopCategory">{ts("category")}</Label>
          <Select
            value={form.watch("shopCategory") ?? undefined}
            onValueChange={(value) =>
              form.setValue("shopCategory", value as ShopCategoryType, {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger id="shopCategory" className="w-full" disabled={true}>
              <SelectValue placeholder={ts("category")} />
            </SelectTrigger>
            <SelectContent>
              {SHOP_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.shopCategory && (
            <p className="text-sm text-destructive">
              {form.formState.errors.shopCategory.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">{ts("description")}</Label>
        <Textarea id="description" rows={4} {...form.register("description")} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <ImageUploadField
          label={tc("logo")}
          folder={`${shopSlug}/shops/logos`}
          value={form.watch("logoUrl") ?? ""}
          onUploaded={(asset) =>
            form.setValue("logoUrl", asset.url, { shouldDirty: true })
          }
          onRemoved={() => form.setValue("logoUrl", "", { shouldDirty: true })}
          shape="square"
        />
        <ImageUploadField
          label={tc("banner")}
          folder={`${shopSlug}/shops/banners`}
          value={form.watch("bannerUrl") ?? ""}
          onUploaded={(asset) =>
            form.setValue("bannerUrl", asset.url, { shouldDirty: true })
          }
          onRemoved={() =>
            form.setValue("bannerUrl", "", { shouldDirty: true })
          }
          shape="wide"
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="isShowInPublic">{ts("show_in_public")}</Label>
          <p className="text-sm text-muted-foreground">
            {ts("show_in_public_description")}
          </p>
        </div>
        <Switch
          id="isShowInPublic"
          checked={form.watch("isShowInPublic")}
          onCheckedChange={(checked) =>
            form.setValue("isShowInPublic", checked, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </div>
    </div>
  );
}
