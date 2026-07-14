// src/components/LanguageSwitcher.tsx
"use client";

import { useTransition } from "react";

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();

  const changeLanguage = (nextLocale: string) => {
    startTransition(() => {
      // Set the standard cookie next-intl looks for
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000;`;
      // Force refreshing the server component tree structure
      window.location.reload();
    });
  };

  return (
    <div style={{ opacity: isPending ? 0.5 : 1 }}>
      <button onClick={() => changeLanguage("en")}>English</button>
      <button onClick={() => changeLanguage("mm")}>မြန်မာ</button>
    </div>
  );
}
