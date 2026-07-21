"use client";

import { useTranslations } from "next-intl";
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
  tc: {
    serial: string;
    name: string;
    slug: string;
    values: string;
    created: string;
  };
}

export function getAttributeColumns({
  page,
  pageSize,
  tc,
}: GetAttributeColumnsParams): ColumnDef<AttributeRow>[] {
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
      id: "values",
      header: tc.values,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.values.map((v) => v.value).join(", ")}
        </span>
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
        <AttributeRowActions
          attributeId={row.original.id}
          attributeName={row.original.name}
        />
      ),
    },
  ];
}
