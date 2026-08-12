"use server";

import { shopOwnerActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { createPromotionSchema, updatePromotionSchema } from "../validations";
import { prisma } from "@/lib/prisma";

async function assertProductsBelongToShop(
  productIds: string[],
  shopId: string,
) {
  if (productIds.length === 0) return;

  const productsCount = await prisma.product.count({
    where: {
      id: { in: productIds },
      shopId,
    },
  });

  if (productsCount !== productIds.length) {
    throw new Error("One or more selected products were not found.");
  }
}

export const createPromotion = shopOwnerActionClient
  .inputSchema(createPromotionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const {
      discountValue,
      startsAt,
      endsAt,
      code,
      description,
      bannerImage,
      productIds,
      ...data
    } = parsedInput;

    try {
      await assertProductsBelongToShop(productIds, ctx.shop.id);

      const promotion = await prisma.promotion.create({
        data: {
          ...data,
          shopId: ctx.shop.id,
          code: code || null,
          description: description || null,
          bannerImage: bannerImage || null,
          discountValue: new Prisma.Decimal(discountValue),
          startsAt: startsAt || null,
          endsAt: endsAt || null,
          products: {
            connect: productIds.map((id) => ({ id })),
          },
        },
      });
      revalidatePath(`/${ctx.shop.slug}/dashboard/promotions`);
      return {
        promotion: {
          ...promotion,
          discountValue: promotion.discountValue.toNumber(),
        },
      };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new Error("A promotion with this slug or code already exists.");
      }
      throw err;
    }
  });

export const updatePromotion = shopOwnerActionClient
  .inputSchema(updatePromotionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const {
      id,
      discountValue,
      startsAt,
      endsAt,
      code,
      description,
      bannerImage,
      productIds,
      ...data
    } = parsedInput;

    try {
      await assertProductsBelongToShop(productIds, ctx.shop.id);

      const updated = await prisma.promotion.update({
        where: { id, shopId: ctx.shop.id },
        data: {
          ...data,
          code: code || null,
          description: description || null,
          bannerImage: bannerImage || null,
          discountValue: new Prisma.Decimal(discountValue),
          startsAt: startsAt || null,
          endsAt: endsAt || null,
          products: {
            set: productIds.map((productId) => ({ id: productId })),
          },
        },
      });
      revalidatePath(`/${ctx.shop.slug}/dashboard/promotions`);
      return {
        promotion: {
          ...updated,
          discountValue: updated.discountValue.toNumber(),
        },
      };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002")
          throw new Error("A promotion with this slug or code already exists.");
        if (err.code === "P2025") throw new Error("Promotion not found.");
      }
      throw err;
    }
  });

export const deletePromotion = shopOwnerActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    await prisma.promotion.delete({
      where: { id: parsedInput.id, shopId: ctx.shop.id },
    });
    revalidatePath(`/${ctx.shop.slug}/dashboard/promotions`);
    return { success: true };
  });
