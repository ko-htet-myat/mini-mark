"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/features/auth/actions";
import { loginSchema } from "@/features/auth/validations";
import { GoogleButton } from "@/features/auth/components/google-btn";

export default function LoginPage() {
  const t = useTranslations("Auth");
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
          if (explicitRedirect) {
            router.push(explicitRedirect);
            return;
          }
          if (data?.shopSlug) {
            router.push(`/${data.shopSlug}/dashboard`);
          } else {
            router.push("/create-shop");
          }
        },
      },
    },
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t("welcome_back")}</h1>
        <p className="text-sm text-muted-foreground">{t("login_subtitle")}</p>
      </div>

      <GoogleButton />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("or_divider")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmitWithAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("email_placeholder")}
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
            <Label htmlFor="password">{t("password")}</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline"
            >
              {t("forgot_password")}
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
          {action.isPending ? t("logging_in") : t("log_in")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <span>{t("no_account")}</span>
        <Link href="/sign-up" className="font-medium text-foreground underline">
          {t("sign_up_link")}
        </Link>
      </p>
    </div>
  );
}
