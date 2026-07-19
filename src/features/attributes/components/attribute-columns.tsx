"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AttributeRowActions } from "./attribute-row-actions";

export type AttributeRow = {
  id: string;
  name: string;
  slug: string;
  values: { id: string; value: string }[];
  createdAt: Date;
};

interface GetAttributeColumnsParams {
  page: number;
  pageSize: number;
}

export function getAttributeColumns({
  page,
  pageSize,
}: GetAttributeColumnsParams): ColumnDef<AttributeRow>[] {
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
      id: "values",
      header: "Values",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.values.map((v) => v.value).join(", ")}
        </span>
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
        <AttributeRowActions
          attributeId={row.original.id}
          attributeName={row.original.name}
        />
      ),
    },
  ];
}
