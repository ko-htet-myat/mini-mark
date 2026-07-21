"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandFormValues, updateBrandSchema } from "../validations";
import { updateBrand } from "../actions";
import { useShop } from "@/context/shop-context";

interface BrandFormProps {
  brand?: { id: string } & BrandFormValues;
}

export function UpdateBrandForm({ brand }: BrandFormProps) {
  const router = useRouter();
  const { slug } = useShop();
  const tc = useTranslations("Common");
  const tb = useTranslations("Brands");

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    updateBrand.bind(null, { shop: slug }),
    zodResolver(updateBrandSchema),
    {
      formProps: {
        defaultValues: {
          id: brand?.id,
          name: brand?.name ?? "",
          slug: brand?.slug ?? "",
          description: brand?.description ?? "",
          logoUrl: brand?.logoUrl ?? "",
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success(tb("brand_updated"));
          router.push(`/${slug}/dashboard/brands`);
        },
      },
    },
  );

  return (
    <form
      onSubmit={handleSubmitWithAction}
      className="flex flex-col gap-5 max-w-lg"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{tc("name")}</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">{tc("slug")}</Label>
        <Input id="slug" {...form.register("slug")} />
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">{tc("description")}</Label>
        <Textarea id="description" rows={3} {...form.register("description")} />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="logoUrl">{tb("logo_url")}</Label>
        <Input
          id="logoUrl"
          placeholder={tb("url_placeholder")}
          {...form.register("logoUrl")}
        />
        {form.formState.errors.logoUrl && (
          <p className="text-sm text-destructive">
            {form.formState.errors.logoUrl.message}
          </p>
        )}
      </div>

      {action.result.serverError && (
        <p className="text-sm text-destructive">{action.result.serverError}</p>
      )}

      <Button type="submit" disabled={action.isPending} className="w-fit">
        {action.isPending ? tc("saving") : tc("save")}
      </Button>
    </form>
  );
}
