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
import { CategoryFormValues, updateCategorySchema } from "../validations";
import { updateCategory } from "../actions";
import { useShop } from "@/context/shop-context";

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
          toast.success("Category updated");
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
          <Label htmlFor="parentId">Parent Category (Optional)</Label>
          <Select
            value={form.watch("parentId") || "none"}
            onValueChange={(v) =>
              form.setValue("parentId", v === "none" ? "" : v)
            }
          >
            <SelectTrigger id="parentId">
              <SelectValue placeholder="Select a parent…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Root Category)</SelectItem>
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...form.register("slug")} />
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...form.register("description")} />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          placeholder="https://..."
          {...form.register("imageUrl")}
        />
        {form.formState.errors.imageUrl && (
          <p className="text-sm text-destructive">
            {form.formState.errors.imageUrl.message}
          </p>
        )}
      </div>

      {action.result.serverError && (
        <p className="text-sm text-destructive">{action.result.serverError}</p>
      )}

      <Button type="submit" disabled={action.isPending} className="w-fit">
        {action.isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
