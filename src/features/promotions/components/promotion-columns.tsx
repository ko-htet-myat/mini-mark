"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PromotionRowActions } from "./promotion-row-actions";
import { Badge } from "@/components/ui/badge";

export type PromotionRow = {
  id: string;
  name: string;
  slug: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  createdAt: Date;
};

interface GetPromotionColumnsParams {
  page: number;
  pageSize: number;
}

export function getPromotionColumns({
  page,
  pageSize,
}: GetPromotionColumnsParams): ColumnDef<PromotionRow>[] {
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
      id: "discount",
      header: "Discount",
      cell: ({ row }) => (
        <span>
          {row.original.discountType === "PERCENTAGE"
            ? `${row.original.discountValue.toString()}%`
            : `${row.original.discountValue.toString()} MMK`}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
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
        <PromotionRowActions
          promotionId={row.original.id}
          promotionName={row.original.name}
        />
      ),
    },
  ];
}
