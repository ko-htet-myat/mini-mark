"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShopAction } from "@/features/shop/actions/shop";
import { createShopSchema } from "@/features/shop/validations/shop";

export default function CreateShopPage() {
  const router = useRouter();

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    createShopAction,
    zodResolver(createShopSchema),
    {
      formProps: {
        defaultValues: { name: "", slug: "" },
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
        <h1 className="text-2xl font-semibold">Create your shop</h1>
        <p className="text-sm text-muted-foreground">
          Pick a name and URL for your storefront.
        </p>
      </div>

      <form onSubmit={handleSubmitWithAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Shop name</Label>
          <Input
            id="name"
            placeholder="Jane's Pottery"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">Shop URL</Label>
          <div className="flex items-center rounded-md border px-3 text-sm text-muted-foreground">
            <span className="shrink-0">marketplace.com/</span>
            <Input
              id="slug"
              placeholder="janes-pottery"
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

        {/* Non-field errors (e.g. "Not authenticated", "You already have a shop") */}
        {action.result.serverError && (
          <p className="text-sm text-destructive">
            {action.result.serverError}
          </p>
        )}

        <Button type="submit" disabled={action.isPending} className="w-full">
          {action.isPending ? "Creating shop..." : "Create shop"}
        </Button>
      </form>
    </div>
  );
}
