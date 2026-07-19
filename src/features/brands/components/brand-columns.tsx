"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BrandRowActions } from "./brand-row-actions";

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
};

interface GetBrandColumnsParams {
  page: number;
  pageSize: number;
}

export function getBrandColumns({
  page,
  pageSize,
}: GetBrandColumnsParams): ColumnDef<BrandRow>[] {
  return [
    {
      id: "serial",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {page * pageSize + row.index + 1}
        </span>
      ),
      size: 48,
    },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.slug}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <BrandRowActions
          brandId={row.original.id}
          brandName={row.original.name}
        />
      ),
    },
  ];
}
