"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Facebook,
  Instagram,
  Twitter,
} from "@hugeicons/core-free-icons";

export function PublicFooter() {
  const t = useTranslations("Footer");
  const th = useTranslations("HomePage");

  return (
    <footer className="bg-zinc-950 text-zinc-300 py-12 md:py-16 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 md:gap-8">
          {/* Brand Info */}
          <div className="space-y-5 col-span-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {th("title")}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              {t("description")}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link
                href="#"
                className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700 hover:text-white transition-colors duration-300"
              >
                <HugeiconsIcon icon={Facebook} size={20} />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700 hover:text-white transition-colors duration-300"
              >
                <HugeiconsIcon icon={Twitter} size={20} />
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700 hover:text-white transition-colors duration-300"
              >
                <HugeiconsIcon icon={Instagram} size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="text-lg font-semibold text-white">
              {t("quick_links")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm hover:text-white hover:underline transition-colors"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/shops"
                  className="text-sm hover:text-white hover:underline transition-colors"
                >
                  {t("shops")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm hover:text-white hover:underline transition-colors"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm hover:text-white hover:underline transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-5">
            <h4 className="text-lg font-semibold text-white">{t("legal")}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm hover:text-white hover:underline transition-colors"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm hover:text-white hover:underline transition-colors"
                >
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-5 col-span-2">
            <h4 className="text-lg font-semibold text-white">
              {t("stay_updated")}
            </h4>
            <p className="text-zinc-400 text-sm">{t("newsletter_text")}</p>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                type="email"
                placeholder={t("email_placeholder")}
                className="bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2.5 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all flex-1"
              />
              <button className="bg-white text-black font-medium px-4 py-2.5 rounded-md hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                {t("subscribe")}{" "}
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} {th("title")}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
