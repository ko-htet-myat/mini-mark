"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateShopAction } from "@/features/shop/actions/edit";
import { updateShopSchema } from "@/features/shop/validations/edit";
import { Shop } from "@/generated/prisma/client";
import { ImageUploadField } from "@/features/cloudinary/image-upload-field";

export function SettingsForm({ shop }: { shop: Shop }) {
  const ts = useTranslations("Settings");
  const tc = useTranslations("Common");

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    updateShopAction,
    zodResolver(updateShopSchema),
    {
      formProps: {
        defaultValues: {
          name: shop.name,
          description: shop.description ?? "",
          contactEmail: shop.contactEmail ?? "",
          contactPhones:
            shop.contactPhones.length > 0 ? shop.contactPhones : [""],
          logoUrl: shop.logoUrl ?? "",
          bannerUrl: shop.bannerUrl ?? "",
        },
      },
      actionProps: {
        onSuccess: () => toast.success(ts("shop_updated")),
      },
    },
  );

  // useFieldArray needs a field of objects, but our schema is string[].
  // Easiest fix: keep the array as strings and manage add/remove manually via form.watch/setValue.
  const phones = form.watch("contactPhones") ?? [];

  function addPhone() {
    form.setValue("contactPhones", [...phones, ""]);
  }

  function removePhone(index: number) {
    form.setValue(
      "contactPhones",
      phones.filter((_, i) => i !== index),
    );
  }

  function updatePhone(index: number, value: string) {
    const next = [...phones];
    next[index] = value;
    form.setValue("contactPhones", next, { shouldValidate: true });
  }

  return (
    <form onSubmit={handleSubmitWithAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{ts("shop_name")}</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">{ts("description")}</Label>
        <Textarea id="description" rows={4} {...form.register("description")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contactEmail">{ts("contact_email")}</Label>
        <Input
          id="contactEmail"
          type="email"
          {...form.register("contactEmail")}
        />
        {form.formState.errors.contactEmail && (
          <p className="text-sm text-destructive">
            {form.formState.errors.contactEmail.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>{ts("contact_phones")}</Label>
        {phones.map((phone, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={phone}
              onChange={(e) => updatePhone(index, e.target.value)}
              placeholder={ts("phone_placeholder")}
            />
            {phones.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePhone(index)}
              >
                <HugeiconsIcon icon={Delete02Icon} size={18} />
              </Button>
            )}
          </div>
        ))}
        {form.formState.errors.contactPhones && (
          <p className="text-sm text-destructive">
            {form.formState.errors.contactPhones.message ??
              form.formState.errors.contactPhones.root?.message}
          </p>
        )}
        {phones.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={addPhone}
          >
            <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" />
            {ts("add_phone")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <ImageUploadField
          label={tc("logo")}
          folder="shops/logos"
          value={form.watch("logoUrl") ?? ""}
          onUploaded={(asset) =>
            form.setValue("logoUrl", asset.url, { shouldDirty: true })
          }
          onRemoved={() => form.setValue("logoUrl", "", { shouldDirty: true })}
          shape="square"
        />
        <ImageUploadField
          label={tc("banner")}
          folder="shops/banners"
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

      {action.result.serverError && (
        <p className="text-sm text-destructive">{action.result.serverError}</p>
      )}

      <Button type="submit" disabled={action.isPending} className="w-fit">
        {action.isPending ? tc("saving") : ts("save_changes")}
      </Button>
    </form>
  );
}
