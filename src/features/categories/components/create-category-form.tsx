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
import { createCategorySchema } from "../validations";
import { createCategory } from "../actions";
import { useShop } from "@/context/shop-context";

interface ParentOption {
  id: string;
  name: string;
  parentId?: string | null;
  parent?: { name: string } | null;
}

interface CreateCategoryFormProps {
  shopId: string;
  /** Pre-selected parentId (from query param) */
  defaultParentId?: string;
  /** Available parent categories to pick from */
  parentOptions: ParentOption[];
}

export function CreateCategoryForm({
  shopId,
  defaultParentId,
  parentOptions,
}: CreateCategoryFormProps) {
  const router = useRouter();
  const { slug } = useShop();

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    createCategory.bind(null, { shop: slug }),
    zodResolver(createCategorySchema),
    {
      formProps: {
        defaultValues: {
          shopId,
          name: "",
          slug: "",
          description: "",
          imageUrl: "",
          parentId: defaultParentId ?? "",
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success("Category created");
          const parentId = form.getValues("parentId");
          router.push(
            `/${slug}/dashboard/categories${parentId ? `?parentId=${parentId}` : ""}`,
          );
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
        {action.isPending ? "Saving..." : "Create Category"}
      </Button>
    </form>
  );
}
