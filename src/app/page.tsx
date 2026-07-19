"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Home() {
  const t = useTranslations("HomePage");
  const t1 = useTranslations("Auth");

  return (
    <main className="flex items-center justify-center h-screen">
      <div className=" text-center space-y-5">
        <h2 className=" text-2xl">{t("title")}</h2>
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
  );
}
