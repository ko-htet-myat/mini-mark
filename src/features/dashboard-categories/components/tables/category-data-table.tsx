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
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { CategoryRow, getCategoryColumns } from "./category-columns";

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface CategoryDataTableProps {
  data: CategoryRow[];
  pageCount: number;
  total: number;
  page: number;
  pageSize: number;
  nameFilter: string;
  /** The parentId currently being browsed (null = root / Level 1) */
  parentId: string | null;
  /** Breadcrumb trail from root to the current parent */
  breadcrumb: BreadcrumbItem[];
  /** Current level (1, 2, or 3) */
  level: number;
}

export function CategoryDataTable({
  data,
  pageCount,
  total,
  page,
  pageSize,
  nameFilter,
  parentId,
  breadcrumb,
  level,
}: CategoryDataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [nameInput, setNameInput] = useState(nameFilter);
  const tc = useTranslations("Common");
  const tcat = useTranslations("Categories");

  const pushParams = useCallback(
    (updates: Record<string, string | number | null>) => {
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
      getCategoryColumns({
        page,
        pageSize,
        level,
        tc: {
          serial: tc("serial"),
          name: tc("name"),
          slug: tc("slug"),
          image: tc("image"),
          subcategories: tcat("subcategories"),
          created: tc("created"),
        },
      }),
    [page, pageSize, level, tc, tcat],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
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

  // Level labels
  const levelLabel =
    level === 1 ? "Category" : level === 2 ? "Subcategory" : "Sub-subcategory";

  // Add button label and create href
  const createHref = parentId
    ? `categories/create?parentId=${parentId}`
    : "categories/create";

  return (
    <div className="space-y-4">
      {/* Level indicator */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder={tc("filter_by_name")}
            value={nameInput}
            onChange={(e) => handleNameFilterChange(e.target.value)}
            className="min-w-xs"
          />
        </div>
        <Button asChild>
          <Link href={createHref}>
            {level === 1
              ? tcat("add_category")
              : level === 2
                ? tcat("add_subcategory")
                : tcat("add_sub_subcategory")}
          </Link>
        </Button>
      </div>

      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2"
          onClick={() => pushParams({ parentId: null, page: 0, name: null })}
          disabled={!parentId}
        >
          {tcat("categories_breadcrumb")}
        </Button>
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.id} className="flex items-center gap-1">
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            {i < breadcrumb.length - 1 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() =>
                  pushParams({ parentId: crumb.id, page: 0, name: null })
                }
              >
                {crumb.name}
              </Button>
            ) : (
              <span className="font-medium text-foreground px-2">
                {crumb.name}
              </span>
            )}
          </span>
        ))}
        <p className=" flex gap-1 text-xs dark:text-green-500 text-green-600 bg-muted px-2 py-1 rounded-md">
          {tcat("level", { level })}
        </p>
      </nav>

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
                  {level === 1
                    ? tcat("no_categories")
                    : tcat("no_subcategories", {
                        label: levelLabel.toLowerCase(),
                      })}
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
