"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import {
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "../validations";
import { returnValidationErrors } from "next-safe-action";

export const updateOrderStatus = actionClient
  .schema(updateOrderStatusSchema)
  .action(async ({ parsedInput }) => {
    const { orderId, shopSlug, status } = parsedInput;

    const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
    if (!shop) {
      return returnValidationErrors(updateOrderStatusSchema, {
        _errors: ["Shop not found"],
      });
    }

    const order = await prisma.order.update({
      where: { id: orderId, shopId: shop.id },
      data: { status },
    });

    revalidatePath(`/${shopSlug}/dashboard/orders`);
    revalidatePath(`/${shopSlug}/dashboard/orders/${orderId}`);

    return { success: true, order };
  });

export const updatePaymentStatus = actionClient
  .schema(updatePaymentStatusSchema)
  .action(async ({ parsedInput }) => {
    const { orderId, shopSlug, paymentStatus } = parsedInput;

    const shop = await prisma.shop.findUnique({ where: { slug: shopSlug } });
    if (!shop) {
      return returnValidationErrors(updatePaymentStatusSchema, {
        _errors: ["Shop not found"],
      });
    }

    const order = await prisma.order.update({
      where: { id: orderId, shopId: shop.id },
      data: { paymentStatus },
    });

    revalidatePath(`/${shopSlug}/dashboard/orders`);
    revalidatePath(`/${shopSlug}/dashboard/orders/${orderId}`);

    return { success: true, order };
  });
