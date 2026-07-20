"use server";

import { shopOwnerActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { createCategorySchema, updateCategorySchema } from "../validations";
import prisma from "@/lib/prisma";

export const createCategory = shopOwnerActionClient
  .inputSchema(createCategorySchema)
  .action(async ({ parsedInput, ctx }) => {
    const { shopId, parentId, ...data } = parsedInput;

    try {
      const category = await prisma.category.create({
        data: {
          ...data,
          shopId,
          parentId: parentId || null,
        },
      });
      revalidatePath(`/${ctx.shop.slug}/dashboard/categories`);
      return { category };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new Error("A category with this slug already exists.");
      }
      throw err;
    }
  });

export const updateCategory = shopOwnerActionClient
  .inputSchema(updateCategorySchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, parentId, ...data } = parsedInput;

    try {
      const updated = await prisma.category.update({
        where: { id },
        data: {
          ...data,
          parentId: parentId || null,
        },
      });
      revalidatePath(`/${ctx.shop.slug}/dashboard/categories`);
      return { category: updated };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002")
          throw new Error("A category with this slug already exists.");
        if (err.code === "P2025") throw new Error("Category not found.");
      }
      throw err;
    }
  });

export const deleteCategory = shopOwnerActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    await prisma.category.delete({ where: { id: parsedInput.id } });
    revalidatePath(`/${ctx.shop.slug}/dashboard/categories`);
    return { success: true };
  });
