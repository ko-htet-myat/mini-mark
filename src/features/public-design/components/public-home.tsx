"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function PublicHome() {
  const t = useTranslations("HomePage");
  const t1 = useTranslations("Auth");

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-5">
          <h2 className="text-2xl lg:text-4xl">{t("title")}</h2>
          <div className="flex gap-4 mt-5 justify-center">
            <Link
              href="/sign-up"
              className="bg-white text-black font-medium px-6 py-2 rounded-md hover:bg-gray-200"
            >
              {t1("sign_up")}
            </Link>
            <Link
              href="/sign-in"
              className="border bg-black border-white text-white font-medium px-6 py-2 rounded-md hover:bg-gray-200 hover:text-black"
            >
              {t1("sign_in")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
