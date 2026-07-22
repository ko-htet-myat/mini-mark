"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { PromotionRow, getPromotionColumns } from "./promotion-columns";
import { useTranslations } from "next-intl";
import { useShop } from "@/context/shop-context";

interface PromotionDataTableProps {
  data: PromotionRow[];
  pageCount: number;
  total: number;
  page: number;
  pageSize: number;
  nameFilter: string;
}

export function PromotionDataTable({
  data,
  pageCount,
  total,
  page,
  pageSize,
  nameFilter,
}: PromotionDataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [nameInput, setNameInput] = useState(nameFilter);
  const tc = useTranslations("Common");
  const tp = useTranslations("Promotions");
  const shop = useShop();

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
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [pathname, router, searchParams],
  );

  const columns = useMemo(
    () =>
      getPromotionColumns({
        page,
        pageSize,
        currency: shop.currency,
        tc: {
          serial: tc("serial"),
          name: tc("name"),
          slug: tc("slug"),
          discount: tp("discount"),
          status: tp("status"),
          created: tc("created"),
        },
        tp: { active: tp("active"), inactive: tp("inactive") },
      }),
    [page, pageSize, shop.currency, tc, tp],
  );

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualFiltering: true,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
  });

  function handleNameFilterChange(value: string) {
    setNameInput(value);
    debouncedFilterChange(value);
  }

  const debouncedFilterChange = useDebouncedCallback((value: string) => {
    pushParams({ name: value, page: 0 });
  }, 350);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder={tc("filter_by_name")}
          value={nameInput}
          onChange={(e) => handleNameFilterChange(e.target.value)}
          className="max-w-sm"
        />
        <Button asChild>
          <Link href="promotions/create">{tp("add_promotion")}</Link>
        </Button>
      </div>

      <div
        className={`rounded-md border transition-opacity ${
          isPending ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {tp("no_promotions")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{tc("total_count", { count: total })}</span>
          <div className="flex items-center gap-2">
            <span>{tc("rows_per_page")}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => pushParams({ pageSize: v, page: 0 })}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {tc("page_of", { page: page + 1, total: pageCount || 1 })}
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
    </div>
  );
}
