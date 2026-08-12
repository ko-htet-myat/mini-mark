"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createPromotionSchema } from "../../validations";
import { createPromotion } from "../../actions";
import { useShop } from "@/context/shop-context";
import { useTranslations } from "next-intl";
import { ImageUploadField } from "@/features/cloudinary/image-upload-field";

type PromotionProductOption = {
  id: string;
  name: string;
  slug: string;
};

interface PromotionFormProps {
  shopId: string;
  productOptions: PromotionProductOption[];
}

export function CreatePromotionForm({
  shopId,
  productOptions,
}: PromotionFormProps) {
  const router = useRouter();
  const { slug } = useShop();
  const tc = useTranslations("Common");
  const tp = useTranslations("Promotions");

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    createPromotion.bind(null, { shop: slug }),
    zodResolver(createPromotionSchema),
    {
      formProps: {
        defaultValues: {
          shopId,
          name: "",
          slug: "",
          description: "",
          bannerImage: "",
          discountType: "PERCENTAGE",
          discountValue: 0,
          code: "",
          isActive: true,
          productIds: [],
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success(tp("promotion_created"));
          router.push(`/${slug}/dashboard/promotions`);
        },
      },
    },
  );

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    form.setValue(
      "slug",
      e.target.value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    );
  }

  function toggleProduct(productId: string, checked: boolean) {
    const selected = form.getValues("productIds") ?? [];
    form.setValue(
      "productIds",
      checked
        ? Array.from(new Set([...selected, productId]))
        : selected.filter((id) => id !== productId),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  return (
    <form onSubmit={handleSubmitWithAction} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className=" col-span-1 lg:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{tc("name")}</Label>
            <Input
              id="name"
              {...form.register("name", { onChange: handleNameChange })}
            />
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
            <Textarea
              id="description"
              rows={3}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="discountType">{tp("discount_type")}</Label>
              <Select
                onValueChange={(v) =>
                  form.setValue(
                    "discountType",
                    v as "PERCENTAGE" | "FIXED_AMOUNT",
                  )
                }
                defaultValue={form.getValues("discountType")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={tp("select_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">{tp("percentage")}</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">
                    {tp("fixed_amount")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="discountValue">{tp("discount_value")}</Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                {...form.register("discountValue")}
              />
              {form.formState.errors.discountValue && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.discountValue.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="code">{tp("promo_code")}</Label>
            <Input id="code" {...form.register("code")} />
            {form.formState.errors.code && (
              <p className="text-sm text-destructive">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <ImageUploadField
            label={tp("banner_image")}
            folder={`shops/${shopId}/promotions`}
            value={form.watch("bannerImage")}
            onUploaded={(asset) =>
              form.setValue("bannerImage", asset.url, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            onRemoved={() =>
              form.setValue("bannerImage", "", {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            shape="wide"
          />
          <div className="flex flex-col gap-3">
            <Label>{tp("target_products")}</Label>
            <div className="rounded-md border">
              {productOptions.length > 0 ? (
                <div className="max-h-64 overflow-y-auto p-3">
                  {productOptions.map((product) => {
                    const selected = form
                      .watch("productIds")
                      ?.includes(product.id);

                    return (
                      <label
                        key={product.id}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(checked) =>
                            toggleProduct(product.id, checked === true)
                          }
                        />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">
                            {product.name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {product.slug}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  {tp("no_product_options")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Switch
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", checked)}
            />
            <Label htmlFor="isActive">{tp("active")}</Label>
          </div>
        </div>
      </div>

      {action.result.serverError && (
        <p className="text-sm text-destructive">{action.result.serverError}</p>
      )}

      <div className="flex items-center gap-4 mt-2">
        <Button type="submit" disabled={action.isPending} className="w-fit">
          {action.isPending ? tc("saving") : tp("create_promotion")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${slug}/dashboard/promotions`)}
          disabled={action.isPending}
        >
          {tc("cancel")}
        </Button>
      </div>
    </form>
  );
}
