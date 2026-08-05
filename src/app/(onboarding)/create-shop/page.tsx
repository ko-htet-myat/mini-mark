"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { createShopAction } from "@/features/shop/actions/shop";
import { createShopSchema } from "@/features/shop/validations/shop";
import { ShopCategoryType } from "@/generated/prisma/enums";

const SHOP_CATEGORIES = Object.values(ShopCategoryType);

export default function CreateShopPage() {
  const t = useTranslations("Onboarding");
  const uiT = useTranslations("UI");
  const router = useRouter();

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    createShopAction,
    zodResolver(createShopSchema),
    {
      formProps: {
        defaultValues: {
          name: "",
          slug: "",
          currency: "MMK",
          shopCategory: undefined,
        },
      },
      actionProps: {
        onSuccess: ({ data }) => {
          router.push(`/${data?.shop.slug}/dashboard`);
        },
      },
    },
  );

  const slug = form.watch("slug");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">{t("create_shop")}</h1>
        <p className="text-sm text-muted-foreground">{t("pick_name_url")}</p>
      </div>

      <form onSubmit={handleSubmitWithAction} className="flex flex-col gap-4">
        {/* Shop name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{t("shop_name")}</Label>
          <Input
            id="name"
            placeholder={t("shop_name_placeholder")}
            {...form.register("name")}
            onChange={(e) => {
              form.register("name").onChange(e);
              if (!form.formState.dirtyFields.slug) {
                const generatedSlug = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                form.setValue("slug", generatedSlug, { shouldValidate: true });
              }
            }}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Shop URL */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">{t("shop_url")}</Label>
          <div className="flex items-center rounded-md border px-3 text-sm text-muted-foreground">
            <span className="shrink-0">marketplace.com/</span>
            <Input
              id="slug"
              placeholder={t("shop_url_placeholder")}
              className="border-0 px-1 shadow-none focus-visible:ring-0"
              {...form.register("slug")}
            />
          </div>
          {slug && (
            <p className="text-xs text-muted-foreground">
              marketplace.com/{slug}
            </p>
          )}
          {form.formState.errors.slug && (
            <p className="text-sm text-destructive">
              {form.formState.errors.slug.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="shopCategory">{t("category")}</Label>
          <Select
            value={form.watch("shopCategory") ?? ""}
            onValueChange={(value) =>
              form.setValue("shopCategory", value as ShopCategoryType, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="shopCategory">
              <SelectValue placeholder={t("category_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {SHOP_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {uiT(`categories.${cat}`)}
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

        {/* Currency */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">{t("currency")}</Label>
          <Select
            value={form.watch("currency")}
            onValueChange={(value) =>
              form.setValue(
                "currency",
                value as "MMK" | "USD" | "JPY" | "KRW" | "THB",
              )
            }
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder={t("currency")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MMK">{uiT("currencies.MMK")}</SelectItem>
              <SelectItem value="USD">{uiT("currencies.USD")}</SelectItem>
              <SelectItem value="JPY">{uiT("currencies.JPY")}</SelectItem>
              <SelectItem value="KRW">{uiT("currencies.KRW")}</SelectItem>
              <SelectItem value="THB">{uiT("currencies.THB")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {action.result.serverError && (
          <p className="text-sm text-destructive">
            {action.result.serverError}
          </p>
        )}

        <Button type="submit" disabled={action.isPending} className="w-full">
          {action.isPending ? t("creating_shop") : t("create_shop_btn")}
        </Button>
      </form>
    </div>
  );
}
