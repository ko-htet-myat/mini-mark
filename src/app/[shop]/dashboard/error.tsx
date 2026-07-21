"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert } from "@hugeicons/core-free-icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-4 px-4">
      <HugeiconsIcon icon={Alert} />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{t("something_went_wrong")}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error?.message || t("unexpected_error")}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset}>
          {t("try_again")}
        </Button>
        <Button asChild>
          <a href="../">{t("back_to_dashboard")}</a>
        </Button>
      </div>
    </div>
  );
}
