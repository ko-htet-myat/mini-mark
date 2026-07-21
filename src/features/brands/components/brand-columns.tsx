"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BrandRowActions } from "./brand-row-actions";

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: Date;
};

interface GetBrandColumnsParams {
  page: number;
  pageSize: number;
  tc: {
    serial: string;
    name: string;
    slug: string;
    logo: string;
    created: string;
  };
}

export function getBrandColumns({
  page,
  pageSize,
  tc,
}: GetBrandColumnsParams): ColumnDef<BrandRow>[] {
  return [
    {
      id: "serial",
      header: tc.serial,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {page * pageSize + row.index + 1}
        </span>
      ),
      size: 48,
    },
    { accessorKey: "name", header: tc.name },
    {
      accessorKey: "slug",
      header: tc.slug,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.slug}</span>
      ),
    },
    {
      id: "logo",
      header: tc.logo,
      cell: ({ row }) =>
        row.original.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.original.logoUrl}
            alt={row.original.name}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "createdAt",
      header: tc.created,
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
