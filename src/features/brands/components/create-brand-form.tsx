"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBrandSchema } from "../validations";
import { createBrand } from "../actions";
import { useShop } from "@/context/shop-context";

interface BrandFormProps {
  shopId: string;
}

export function CreateBrandForm({ shopId }: BrandFormProps) {
  const router = useRouter();
  const { slug } = useShop();

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    createBrand.bind(null, { shop: slug }),
    zodResolver(createBrandSchema),
    {
      formProps: {
        defaultValues: {
          shopId,
          name: "",
          slug: "",
          description: "",
          logoUrl: "",
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success("Brand created");
          router.push(`/${slug}/dashboard/brands`);
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
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input
          id="logoUrl"
          placeholder="https://..."
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
        {action.isPending ? "Saving..." : "Create brand"}
      </Button>
    </form>
  );
}
