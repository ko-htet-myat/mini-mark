"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/features/auth/actions";
import { loginSchema } from "@/features/auth/validations";
import { GoogleButton } from "@/features/auth/components/google-btn";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect");

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    loginAction,
    zodResolver(loginSchema),
    {
      formProps: {
        defaultValues: { email: "", password: "" },
      },
      actionProps: {
        onSuccess: ({ data }) => {
          // if middleware bounced them from a specific page, honor that first
          if (explicitRedirect) {
            router.push(explicitRedirect);
            return;
          }
          if (data?.shopSlug) {
            router.push(`/${data.shopSlug}/dashboard`);
          } else {
            router.push("/onboarding/create-shop");
          }
        },
      },
    },
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Log in to manage your shop.
        </p>
      </div>

      <GoogleButton />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmitWithAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {action.result.serverError && (
          <p className="text-sm text-destructive">
            {action.result.serverError}
          </p>
        )}

        <Button type="submit" disabled={action.isPending} className="w-full">
          {action.isPending ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <span>{" Don't have an account?"}</span>
        <Link href="/signup" className="font-medium text-foreground underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
