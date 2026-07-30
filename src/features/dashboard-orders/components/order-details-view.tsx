"use client";

import { useTransition } from "react";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import {
  updateOrderStatus,
  updatePaymentStatus,
} from "../actions/update-order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";

interface OrderDetailsViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any; // Using any here for simplicity, ideally map to full Order type including items
  shopSlug: string;
}

export function OrderDetailsView({ order, shopSlug }: OrderDetailsViewProps) {
  const [isPending, startTransition] = useTransition();
  const tcRaw = useTranslations("Common");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tc = tcRaw as any;

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus({
        orderId: order.id,
        shopSlug,
        status: newStatus as OrderStatus,
      });

      if (res?.data?.success) {
        toast.success(
          tc("status_updated", { fallback: "Order status updated" }),
        );
      } else {
        toast.error(
          tc("failed_to_update", { fallback: "Failed to update status" }),
        );
      }
    });
  };

  const handlePaymentStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const res = await updatePaymentStatus({
        orderId: order.id,
        shopSlug,
        paymentStatus: newStatus as PaymentStatus,
      });

      if (res?.data?.success) {
        toast.success(
          tc("status_updated", { fallback: "Payment status updated" }),
        );
      } else {
        toast.error(
          tc("failed_to_update", { fallback: "Failed to update status" }),
        );
      }
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>
            {tc("customer_info", { fallback: "Customer Information" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-muted-foreground">
              {tc("name", { fallback: "Name" })}
            </Label>
            <div>{order.customerName}</div>
          </div>
          <div>
            <Label className="text-muted-foreground">
              {tc("phone", { fallback: "Phone" })}
            </Label>
            <div>{order.customerPhone}</div>
          </div>
          {order.customerEmail && (
            <div>
              <Label className="text-muted-foreground">
                {tc("email", { fallback: "Email" })}
              </Label>
              <div>{order.customerEmail}</div>
            </div>
          )}
          {order.shippingAddress && (
            <div>
              <Label className="text-muted-foreground">
                {tc("shipping_address", { fallback: "Shipping Address" })}
              </Label>
              <div>
                {order.shippingAddress}, {order.shippingCity}
              </div>
            </div>
          )}
          {order.note && (
            <div>
              <Label className="text-muted-foreground">
                {tc("note", { fallback: "Note" })}
              </Label>
              <div>{order.note}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {tc("order_status", { fallback: "Order & Payment Status" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{tc("status", { fallback: "Order Status" })}</Label>
            <Select
              disabled={isPending}
              value={order.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{tc("paymentStatus", { fallback: "Payment Status" })}</Label>
            <Select
              disabled={isPending}
              value={order.paymentStatus}
              onValueChange={handlePaymentStatusChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PaymentStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{tc("line_items", { fallback: "Line Items" })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tc("product", { fallback: "Product" })}</TableHead>
                <TableHead>{tc("variant", { fallback: "Variant" })}</TableHead>
                <TableHead>{tc("price", { fallback: "Price" })}</TableHead>
                <TableHead>
                  {tc("quantity", { fallback: "Quantity" })}
                </TableHead>
                <TableHead className="text-right">
                  {tc("subtotal", { fallback: "Subtotal" })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {order.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.variantLabel || "-"}</TableCell>
                  <TableCell>
                    {Number(item.price).toLocaleString()} {order.currency}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {Number(item.subtotal).toLocaleString()} {order.currency}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2 text-right">
            <div>
              <span className="text-muted-foreground mr-4">
                {tc("subtotal", { fallback: "Subtotal" })}
              </span>
              <span className="font-medium">
                {Number(order.subtotal).toLocaleString()} {order.currency}
              </span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div>
                <span className="text-muted-foreground mr-4">
                  {tc("discount", { fallback: "Discount" })}
                </span>
                <span className="font-medium text-destructive">
                  -{Number(order.discountAmount).toLocaleString()}{" "}
                  {order.currency}
                </span>
              </div>
            )}
            <div className="text-lg font-bold">
              <span className="mr-4">{tc("total", { fallback: "Total" })}</span>
              <span>
                {Number(order.total).toLocaleString()} {order.currency}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
