"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OrderRowActions } from "./order-row-actions";
import { Badge } from "@/components/ui/badge";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

export type OrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
};

interface GetOrderColumnsParams {
  page: number;
  pageSize: number;
  tc: {
    serial: string;
    orderNumber: string;
    customer: string;
    date: string;
    total: string;
    status: string;
    paymentStatus: string;
  };
}

export function getOrderColumns({
  page,
  pageSize,
  tc,
}: GetOrderColumnsParams): ColumnDef<OrderRow>[] {
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
    { accessorKey: "orderNumber", header: tc.orderNumber },
    { accessorKey: "customerName", header: tc.customer },
    {
      accessorKey: "createdAt",
      header: tc.date,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: "total",
      header: tc.total,
      cell: ({ row }) => (
        <span>
          {Number(row.original.total).toLocaleString()} {row.original.currency}
        </span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: tc.paymentStatus,
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.paymentStatus}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: tc.status,
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "DELIVERED" ? "default" : "secondary"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <OrderRowActions orderId={row.original.id} />,
    },
  ];
}
