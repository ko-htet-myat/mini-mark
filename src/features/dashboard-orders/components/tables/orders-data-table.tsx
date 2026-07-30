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
import { useTranslations } from "next-intl";
import { OrderRow, getOrderColumns } from "./order-columns";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

interface OrdersDataTableProps {
  data: OrderRow[];
  pageCount: number;
  total: number;
  page: number;
  pageSize: number;
  queryFilter: string;
  statusFilter: OrderStatus | null;
  paymentStatusFilter: PaymentStatus | null;
}

export function OrdersDataTable({
  data,
  pageCount,
  total,
  page,
  pageSize,
  queryFilter,
  statusFilter,
  paymentStatusFilter,
}: OrdersDataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [queryInput, setQueryInput] = useState(queryFilter);
  const tcRaw = useTranslations("Common");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tc = tcRaw as any;

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
      getOrderColumns({
        page,
        pageSize,
        tc: {
          serial: tc("serial", { fallback: "#" }),
          orderNumber: tc("orderNumber", { fallback: "Order ID" }),
          customer: tc("customer", { fallback: "Customer" }),
          date: tc("date", { fallback: "Date" }),
          total: tc("total", { fallback: "Total" }),
          status: tc("status", { fallback: "Status" }),
          paymentStatus: tc("paymentStatus", { fallback: "Payment" }),
        },
      }),
    [page, pageSize, tc],
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

  function handleQueryChange(value: string) {
    setQueryInput(value);
    debouncedFilterChange(value);
  }

  const debouncedFilterChange = useDebouncedCallback((value: string) => {
    pushParams({ query: value, page: 0 });
  }, 350);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Input
            placeholder={tc("search", { fallback: "Search orders..." })}
            value={queryInput}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="min-w-xs"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Select
            value={statusFilter ?? "ALL"}
            onValueChange={(v) =>
              pushParams({ status: v === "ALL" ? null : v, page: 0 })
            }
          >
            <SelectTrigger className="w-37.5">
              <SelectValue
                placeholder={tc("all_statuses", { fallback: "All Statuses" })}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {tc("all_statuses", { fallback: "All Statuses" })}
              </SelectItem>
              {Object.values(OrderStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={paymentStatusFilter ?? "ALL"}
            onValueChange={(v) =>
              pushParams({ paymentStatus: v === "ALL" ? null : v, page: 0 })
            }
          >
            <SelectTrigger className="w-45">
              <SelectValue
                placeholder={tc("all_payments", { fallback: "All Payments" })}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {tc("all_payments", { fallback: "All Payments" })}
              </SelectItem>
              {Object.values(PaymentStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
                  {tc("no_orders_found", { fallback: "No orders found." })}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {tc("total_count", { count: total, fallback: `${total} rows` })}
          </span>
          <div className="flex items-center gap-2">
            <span>{tc("rows_per_page", { fallback: "Rows per page:" })}</span>
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
            {tc("page_of", {
              page: page + 1,
              total: pageCount || 1,
              fallback: `Page ${page + 1} of ${pageCount || 1}`,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pushParams({ page: page - 1 })}
              disabled={page === 0 || isPending}
            >
              {tc("previous", { fallback: "Previous" })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pushParams({ page: page + 1 })}
              disabled={page + 1 >= pageCount || isPending}
            >
              {tc("next", { fallback: "Next" })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
