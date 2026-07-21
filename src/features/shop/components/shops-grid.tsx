"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";

interface ShopCardData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
}

interface ShopGridProps {
  data: ShopCardData[];
  total: number;
  pageCount: number;
  page: number;
  nameFilter: string;
}

export function ShopGrid({
  data,
  total,
  pageCount,
  page,
  nameFilter,
}: ShopGridProps) {
  const t = useTranslations("Shops");
  const tc = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [nameInput, setNameInput] = useState(nameFilter);

  const pushParams = useCallback(
    (updates: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      startTransition(() =>
        router.push(`${pathname}?${params.toString()}`, { scroll: false }),
      );
    },
    [pathname, router, searchParams],
  );

  const debouncedFilterChange = useDebouncedCallback((value: string) => {
    pushParams({ name: value, page: 0 });
  }, 300);

  function handleNameFilterChange(value: string) {
    setNameInput(value);
    if (!value) {
      debouncedFilterChange(value);
    }
  }

  function handleSearch() {
    pushParams({ name: nameInput, page: 0 });
  }

  return (
    <div className="space-y-6">
      <div className=" flex gap-2">
        <Input
          placeholder={t("search_shops_placeholder")}
          value={nameInput}
          onChange={(e) => handleNameFilterChange(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleSearch}>{tc("search")}</Button>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${
          isPending ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        {data.length ? (
          data.map((shop) => (
            <Link
              key={shop.id}
              href={`/${shop.slug}`}
              className="group rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-32 bg-muted">
                {shop.bannerUrl && (
                  <Image
                    src={shop.bannerUrl}
                    alt=""
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-4 flex gap-3 items-start">
                <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-background border">
                  {shop.logoUrl && (
                    <Image
                      src={shop.logoUrl}
                      alt={shop.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium truncate group-hover:underline">
                    {shop.name}
                  </h3>
                  {shop.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {shop.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-12">
            {t("no_shops_found")}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t("shops_count", { count: total })}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => pushParams({ page: page - 1 })}
            disabled={page === 0 || isPending}
          >
            {tc("previous")}
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            {tc("page_of", { page: page + 1, total: pageCount || 1 })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => pushParams({ page: page + 1 })}
            disabled={page + 1 >= pageCount || isPending}
          >
            {tc("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
