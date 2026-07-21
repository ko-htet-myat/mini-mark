"use client";

import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction } from "@/features/auth/actions";
import { signupSchema } from "@/features/auth/validations";
import { GoogleButton } from "@/features/auth/components/google-btn";

export default function SignupPage() {
  const t = useTranslations("Auth");
  const router = useRouter();

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    signupAction,
    zodResolver(signupSchema),
    {
      formProps: {
        defaultValues: { name: "", email: "", password: "" },
      },
      actionProps: {
        onSuccess: () => {
          router.push("/create-shop");
        },
      },
    },
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t("create_account")}</h1>
        <p className="text-sm text-muted-foreground">{t("signup_subtitle")}</p>
      </div>

      <GoogleButton />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("or_divider")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmitWithAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{t("full_name")}</Label>
          <Input
            id="name"
            placeholder={t("name_placeholder")}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

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
          <Label htmlFor="password">{t("password")}</Label>
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
          {action.isPending ? t("creating_account") : t("create_account_btn")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("already_account")}{" "}
        <Link href="/sign-in" className="font-medium text-foreground underline">
          {t("log_in_link")}
        </Link>
      </p>
    </div>
  );
}
