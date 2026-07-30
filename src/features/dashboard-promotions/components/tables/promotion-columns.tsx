"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PromotionRowActions } from "./promotion-row-actions";
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/lib/format";

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
  currency: string;
  tc: {
    serial: string;
    name: string;
    slug: string;
    discount: string;
    status: string;
    created: string;
  };
  tp: { active: string; inactive: string };
}

export function getPromotionColumns({
  page,
  pageSize,
  currency,
  tc,
  tp,
}: GetPromotionColumnsParams): ColumnDef<PromotionRow>[] {
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
      id: "discount",
      header: tc.discount,
      cell: ({ row }) => (
        <span>
          {row.original.discountType === "PERCENTAGE"
            ? `${row.original.discountValue.toString()}%`
            : formatAmount(row.original.discountValue, currency)}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: tc.status,
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? tp.active : tp.inactive}
        </Badge>
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
        <PromotionRowActions
          promotionId={row.original.id}
          promotionName={row.original.name}
        />
      ),
    },
  ];
}
