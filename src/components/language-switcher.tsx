"use client";

import { useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocaleCookie } from "@/utils/language";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "mm", label: "Myanmar", flag: "🇲🇲" },
] as const;

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const currentLocale = useLocale();

  const changeLanguage = (nextLocale: string) => {
    if (nextLocale === currentLocale) return;

    setLocaleCookie(nextLocale);

    startTransition(() => {
      router.refresh();
    });
  };

  const current =
    LANGUAGES.find((l) => l.code === currentLocale) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={"sm"}
          disabled={isPending}
          className="gap-2"
        >
          <span className="text-base leading-none">{current.flag}</span>
          {/* <span>{current.label}</span> */}
          <HugeiconsIcon
            icon={Globe02Icon}
            size={16}
            className="text-muted-foreground"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-40">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2">
              {/* <span className="text-base leading-none">{lang.flag}</span> */}
              <span>{lang.label}</span>
            </span>
            {lang.code === currentLocale && (
              <HugeiconsIcon
                icon={Tick02Icon}
                size={16}
                className="text-primary"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
