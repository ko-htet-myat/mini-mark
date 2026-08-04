"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import { GridViewIcon, ListViewIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import type { ShopProduct } from "../data/products.queries";

type ViewMode = "grid" | "list";

type ProductGridProps = {
  shopSlug: string;
  products: ShopProduct[];
  page: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
  currency?: string;
  /** Base path for pagination links. Defaults to shop home anchor. */
  basePath?: string;
};

const STORAGE_KEY = "product-view";

const viewListeners = new Set<() => void>();

function subscribeView(callback: () => void) {
  viewListeners.add(callback);
  window.addEventListener("storage", handleStorageEvent);
  return () => {
    viewListeners.delete(callback);
    window.removeEventListener("storage", handleStorageEvent);
  };
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key === STORAGE_KEY) {
    for (const listener of viewListeners) {
      listener();
    }
  }
}

function getViewSnapshot(): ViewMode {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "list" ? "list" : "grid";
}

function getViewServerSnapshot(): ViewMode {
  return "grid";
}

function setViewMode(next: ViewMode) {
  window.localStorage.setItem(STORAGE_KEY, next);
  for (const listener of viewListeners) {
    listener();
  }
}

function buildPageHref(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams(
    Object.entries(searchParams ?? {}).filter(([, v]) => v !== undefined) as [
      string,
      string,
    ][],
  );
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export function ProductGrid({
  shopSlug,
  products,
  page,
  totalPages,
  searchParams,
  currency,
  basePath,
}: ProductGridProps) {
  const t = useTranslations("Storefront");
  const view = useSyncExternalStore(
    subscribeView,
    getViewSnapshot,
    getViewServerSnapshot,
  );

  const resolvedBasePath = basePath ?? `/${shopSlug}#products`;

  return (
    <section id="products" className=" pb-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="sm:text-lg font-semibold">{t("products_title")}</h2>
        <div className="flex items-center rounded-md border bg-background p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label={t("grid_view")}
            aria-pressed={view === "grid"}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md transition-colors",
              view === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <HugeiconsIcon
              icon={GridViewIcon}
              strokeWidth={2}
              className="size-4"
            />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label={t("list_view")}
            aria-pressed={view === "list"}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md transition-colors",
              view === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <HugeiconsIcon
              icon={ListViewIcon}
              strokeWidth={2}
              className="size-4"
            />
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("no_products")}</p>
      ) : (
        <div
          className={cn(
            view === "grid"
              ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
              : "flex flex-col gap-4",
          )}
        >
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              shopSlug={shopSlug}
              product={product}
              variant={view}
              loading={index < 4 ? "eager" : undefined}
              currency={currency}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildPageHref(resolvedBasePath, page - 1, searchParams)}
              className="text-sm underline"
            >
              {t("previous")}
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {t("page_of", { page, total: totalPages })}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageHref(resolvedBasePath, page + 1, searchParams)}
              className="text-sm underline"
            >
              {t("next")}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
