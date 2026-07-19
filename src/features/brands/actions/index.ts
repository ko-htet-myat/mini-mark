"use server";

import { shopOwnerActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { createBrandSchema, updateBrandSchema } from "../validations";
import prisma from "@/lib/prisma";

export const createBrand = shopOwnerActionClient
  .inputSchema(createBrandSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { shopId, ...data } = parsedInput;

    try {
      const brand = await prisma.brand.create({ data: { ...data, shopId } });
      revalidatePath(`/${ctx.shop.slug}/dashboard/brands`);
      return { brand };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new Error("A brand with this slug already exists.");
      }
      throw err;
    }
  });

export const updateBrand = shopOwnerActionClient
  .inputSchema(updateBrandSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...data } = parsedInput;

    try {
      const updated = await prisma.brand.update({ where: { id }, data });
      revalidatePath(`/${ctx.shop.slug}/dashboard/brands`);
      return { brand: updated };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002")
          throw new Error("A brand with this slug already exists.");
        if (err.code === "P2025") throw new Error("Brand not found.");
      }
      throw err;
    }
  });

export const deleteBrand = shopOwnerActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    await prisma.brand.delete({ where: { id: parsedInput.id } });
    revalidatePath(`/${ctx.shop.slug}/dashboard/brands`);
    return { success: true };
  });
