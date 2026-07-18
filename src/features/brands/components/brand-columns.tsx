"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BrandRowActions } from "./brand-row-actions";

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
};

export const brandColumns: ColumnDef<BrandRow>[] = [
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
