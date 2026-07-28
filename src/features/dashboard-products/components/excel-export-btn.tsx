"use client";

import { useState } from "react";
import { toast } from "sonner";

export interface ProductListFilters {
  name?: string;
  categoryId?: string;
  brandId?: string;
  status?: "all" | "active" | "inactive";
  from?: string;
  to?: string;
}

interface ExportProductsButtonProps {
  shopSlug: string;
  /** Pass the same filter state your product list/table is currently using. */
  filters?: ProductListFilters;
}

function buildQueryString(filters: ProductListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.brandId) params.set("brandId", filters.brandId);
  if (filters.status && filters.status !== "all")
    params.set("status", filters.status);
  if (filters.from) params.set("dateFrom", filters.from);
  if (filters.to) params.set("dateTo", filters.to);
  return params.toString();
}

export function ExportProductsButton({
  shopSlug,
  filters,
}: ExportProductsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const qs = buildQueryString(filters);
      const url = `/${shopSlug}/dashboard/products/export${qs ? `?${qs}` : ""}`;
      const res = await fetch(url);

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
      toast.error("Couldn't export products. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium
                 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {isExporting ? "Exporting…" : "Export to Excel"}
    </button>
  );
}
