"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAttributeSchema } from "../validations";
import { updateAttribute } from "../actions";
import { useShop } from "@/context/shop-context";

interface EditAttributeFormProps {
  attribute: {
    id: string;
    name: string;
    slug: string;
    values: { id: string; value: string }[];
  };
}

export function EditAttributeForm({ attribute }: EditAttributeFormProps) {
  const router = useRouter();
  const { slug: shopSlug } = useShop();

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    updateAttribute.bind(null, { shop: shopSlug }),
    zodResolver(updateAttributeSchema),
    {
      formProps: {
        defaultValues: {
          id: attribute.id,
          name: attribute.name,
          slug: attribute.slug,
          values:
            attribute.values.length > 0
              ? attribute.values.map((v) => v.value)
              : [""],
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success("Attribute updated");
          router.push(`/${shopSlug}/dashboard/attributes`);
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

  const values = form.watch("values") ?? [];

  function addValue() {
    form.setValue("values", [...values, ""]);
  }

  function removeValue(index: number) {
    form.setValue(
      "values",
      values.filter((_, i) => i !== index),
    );
  }

  function updateValue(index: number, val: string) {
    const next = [...values];
    next[index] = val;
    form.setValue("values", next, { shouldValidate: true });
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
        <Label>Values</Label>
        {values.map((val, index) => (
          <div key={index} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Input
                value={val}
                onChange={(e) => updateValue(index, e.target.value)}
                placeholder="e.g. Red, XL, Cotton..."
              />
              {values.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeValue(index)}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={18} />
                </Button>
              )}
            </div>
            {form.formState.errors.values?.[index] && (
              <p className="text-sm text-destructive">
                {form.formState.errors.values[index]?.message}
              </p>
            )}
          </div>
        ))}
        {(form.formState.errors.values?.root?.message ||
          (form.formState.errors.values as { message?: string })?.message) && (
          <p className="text-sm text-destructive">
            {form.formState.errors.values?.root?.message ||
              (form.formState.errors.values as { message?: string })?.message}
          </p>
        )}
        {values.length < 50 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={addValue}
          >
            <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" />
            Add value
          </Button>
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
