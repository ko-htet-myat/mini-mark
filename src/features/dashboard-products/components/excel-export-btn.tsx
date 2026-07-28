"use client";

import { useState } from "react";
import { FileSpreadsheetIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export interface ProductListFilters {
  name?: string;
  categoryId?: string;
  brandId?: string;
  status?: "all" | "active" | "draft";
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

interface ExportProductsButtonProps {
  shopSlug: string;
  filters?: ProductListFilters;
}

function buildQueryString(filters: ProductListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.brandId) params.set("brandId", filters.brandId);
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.from) params.set("dateFrom", filters.from);
  if (filters.to) params.set("dateTo", filters.to);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.pageSize !== undefined)
    params.set("pageSize", String(filters.pageSize));
  return params.toString();
}

export function ExportProductsButton({
  shopSlug,
  filters,
}: ExportProductsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const t = useTranslations("Products");

  async function handleExport() {
    setIsExporting(true);
    try {
      const params = buildQueryString(filters);
      const url = `/api/exports/product?shop=${encodeURIComponent(shopSlug)}${
        params ? `&${params}` : ""
      }`;
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        throw new Error("Export failed");
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `products-${shopSlug}.xlsx`;

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error(t("export_products_error"));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleExport}
        disabled={isExporting}
      >
        <HugeiconsIcon icon={FileSpreadsheetIcon} size={16} />
        {t("export_products")}
      </Button>
    </div>
  );
}
