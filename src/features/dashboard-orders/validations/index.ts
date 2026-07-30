import { z } from "zod";

export const createOrderItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  shopSlug: z.string(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional(),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  note: z.string().optional(),
  paymentMethod: z
    .enum(["BANK_TRANSFER", "CASH", "MOBILE_MONEY", "OTHER"])
    .optional(),
  promotionCode: z.string().optional(),
  items: z.array(createOrderItemSchema).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid(),
  shopSlug: z.string(),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELED",
    "REFUNDED",
  ]),
});

export const updatePaymentStatusSchema = z.object({
  orderId: z.string().cuid(),
  shopSlug: z.string(),
  paymentStatus: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID", "REFUNDED"]),
});
