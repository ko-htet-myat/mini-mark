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
import { useTranslations } from "next-intl";
import { CategoryFormValues, updateCategorySchema } from "../validations";
import { updateCategory } from "../actions";
import { useShop } from "@/context/shop-context";
import { ImageUploadField } from "@/features/cloudinary/image-upload-field";

interface ParentOption {
  id: string;
  name: string;
  parentId?: string | null;
  parent?: { name: string } | null;
}

interface UpdateCategoryFormProps {
  category: { id: string } & CategoryFormValues;
  /** Available parent categories to pick from (all L1 or all L2, depending on level) */
  parentOptions: ParentOption[];
}

export function UpdateCategoryForm({
  category,
  parentOptions,
}: UpdateCategoryFormProps) {
  const router = useRouter();
  const { slug } = useShop();
  const tc = useTranslations("Common");
  const tcat = useTranslations("Categories");

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    updateCategory.bind(null, { shop: slug }),
    zodResolver(updateCategorySchema),
    {
      formProps: {
        defaultValues: {
          id: category.id,
          name: category.name ?? "",
          slug: category.slug ?? "",
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          parentId: category.parentId ?? "",
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success(tcat("category_updated"));
          const parentId = form.getValues("parentId");
          router.push(
            `/${slug}/dashboard/categories${parentId ? `?parentId=${parentId}` : ""}`,
          );
        },
      },
    },
  );

  return (
    <form
      onSubmit={handleSubmitWithAction}
      className="flex flex-col gap-5 max-w-lg"
    >
      {parentOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="parentId">{tcat("parent_category")}</Label>
          <Select
            value={form.watch("parentId") || "none"}
            onValueChange={(v) =>
              form.setValue("parentId", v === "none" ? "" : v)
            }
          >
            <SelectTrigger id="parentId">
              <SelectValue placeholder={tcat("select_parent")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{tcat("none_root_category")}</SelectItem>
              {parentOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.parent ? `${opt.parent.name} → ${opt.name}` : opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.parentId && (
            <p className="text-sm text-destructive">
              {form.formState.errors.parentId.message}
            </p>
          )}
        </div>
      )}

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

      <ImageUploadField
        label={tcat("image_url")}
        folder={`${slug}/categories/images`}
        value={form.watch("imageUrl") ?? ""}
        onUploaded={(asset) =>
          form.setValue("imageUrl", asset.url, { shouldDirty: true })
        }
        onRemoved={() => form.setValue("imageUrl", "", { shouldDirty: true })}
      />

      {action.result.serverError && (
        <p className="text-sm text-destructive">{action.result.serverError}</p>
      )}

      <Button type="submit" disabled={action.isPending} className="w-fit">
        {action.isPending ? tc("saving") : tc("save")}
      </Button>
    </form>
  );
}
