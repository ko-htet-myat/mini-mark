"use server";

import { shopOwnerActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { createPromotionSchema, updatePromotionSchema } from "../validations";
import { prisma } from "@/lib/prisma";

export const createPromotion = shopOwnerActionClient
  .inputSchema(createPromotionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const {
      shopId,
      discountValue,
      startsAt,
      endsAt,
      code,
      description,
      ...data
    } = parsedInput;

    try {
      const promotion = await prisma.promotion.create({
        data: {
          ...data,
          shopId,
          code: code || null,
          description: description || null,
          discountValue: new Prisma.Decimal(discountValue),
          startsAt: startsAt || null,
          endsAt: endsAt || null,
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
    const { id, discountValue, startsAt, endsAt, code, description, ...data } =
      parsedInput;

    try {
      const updated = await prisma.promotion.update({
        where: { id },
        data: {
          ...data,
          code: code || null,
          description: description || null,
          discountValue: new Prisma.Decimal(discountValue),
          startsAt: startsAt || null,
          endsAt: endsAt || null,
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
    await prisma.promotion.delete({ where: { id: parsedInput.id } });
    revalidatePath(`/${ctx.shop.slug}/dashboard/promotions`);
    return { success: true };
  });
