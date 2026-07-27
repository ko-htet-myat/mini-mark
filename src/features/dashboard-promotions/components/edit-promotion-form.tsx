"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updatePromotionSchema } from "../validations";
import { updatePromotion } from "../actions";
import { useShop } from "@/context/shop-context";
import { useTranslations } from "next-intl";

interface EditPromotionFormProps {
  promotion: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    code: string | null;
    isActive: boolean;
  };
}

export function EditPromotionForm({ promotion }: EditPromotionFormProps) {
  const router = useRouter();
  const { slug } = useShop();
  const tc = useTranslations("Common");
  const tp = useTranslations("Promotions");

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    updatePromotion.bind(null, { shop: slug }),
    zodResolver(updatePromotionSchema),
    {
      formProps: {
        defaultValues: {
          id: promotion.id,
          name: promotion.name,
          slug: promotion.slug,
          description: promotion.description || "",
          discountType: promotion.discountType,
          discountValue: Number(promotion.discountValue),
          code: promotion.code || "",
          isActive: promotion.isActive,
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success(tp("promotion_updated"));
          router.push(`/${slug}/dashboard/promotions`);
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

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="discountType">{tp("discount_type")}</Label>
          <Select
            onValueChange={(v) =>
              form.setValue("discountType", v as "PERCENTAGE" | "FIXED_AMOUNT")
            }
            defaultValue={form.getValues("discountType")}
          >
            <SelectTrigger>
              <SelectValue placeholder={tp("select_type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">{tp("percentage")}</SelectItem>
              <SelectItem value="FIXED_AMOUNT">{tp("fixed_amount")}</SelectItem>
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

      <div className="flex items-center gap-2 mt-2">
        <Switch
          id="isActive"
          checked={form.watch("isActive")}
          onCheckedChange={(checked) => form.setValue("isActive", checked)}
        />
        <Label htmlFor="isActive">{tp("active")}</Label>
      </div>

      {action.result.serverError && (
        <p className="text-sm text-destructive">{action.result.serverError}</p>
      )}

      <div className="flex items-center gap-4 mt-2">
        <Button type="submit" disabled={action.isPending}>
          {action.isPending ? tc("saving") : tc("save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={action.isPending}
        >
          {tc("cancel")}
        </Button>
      </div>
    </form>
  );
}
