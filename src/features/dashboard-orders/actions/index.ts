"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action"; // your base next-safe-action client
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "../validations";
import { returnValidationErrors } from "next-safe-action";

export const createOrder = actionClient
  .schema(createOrderSchema)
  .action(async ({ parsedInput }) => {
    const { shopSlug, items, promotionCode, ...customerInfo } = parsedInput;

    const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
    if (!shop) {
      return returnValidationErrors(createOrderSchema, {
        _errors: ["Shop not found"],
      });
    }

    // load products/variants server-side — never trust client-submitted prices
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, shopId: shop.id, isActive: true },
      include: { variants: true },
    });

    const promotion = promotionCode
      ? await prisma.promotion.findFirst({
          where: { shopId: shop.id, code: promotionCode, isActive: true },
        })
      : null;

    // build line items with server-trusted prices
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not available`);

      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : null;

      const unitPrice = variant?.price ?? product.price;
      const subtotal = Number(unitPrice) * item.quantity;

      return {
        productId: product.id,
        variantId: variant?.id ?? null,
        productName: product.name,
        variantLabel: variant?.sku ?? null, // swap for a real attribute-value label if you build one
        sku: variant?.sku ?? null,
        price: unitPrice,
        quantity: item.quantity,
        subtotal,
      };
    });

    const subtotal = lineItems.reduce((sum, li) => sum + li.subtotal, 0);
    const discountAmount = promotion
      ? promotion.discountType === "PERCENTAGE"
        ? subtotal * (Number(promotion.discountValue) / 100)
        : Number(promotion.discountValue)
      : 0;
    const total = Math.max(subtotal - discountAmount, 0);

    const order = await prisma.$transaction(async (tx) => {
      const orderCount = await tx.order.count({ where: { shopId: shop.id } });
      const orderNumber = `ORD-${String(orderCount + 1).padStart(5, "0")}`;

      return tx.order.create({
        data: {
          shopId: shop.id,
          orderNumber,
          currency: shop.currency,
          subtotal,
          discountAmount,
          total,
          promotionId: promotion?.id,
          ...customerInfo,
          items: { create: lineItems },
        },
        include: { items: true },
      });
    });

    revalidatePath(`/${shopSlug}/dashboard/orders`);
    revalidatePath(`/${shopSlug}/dashboard/sales`);

    return { order };
  });
