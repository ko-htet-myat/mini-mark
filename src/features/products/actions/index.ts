"use server";

import { shopOwnerActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  toggleProductStatusSchema,
} from "../validations";
import prisma from "@/lib/prisma";

export const createProduct = shopOwnerActionClient
  .inputSchema(createProductSchema)
  .action(async ({ parsedInput, ctx }) => {
    const {
      shopId,
      categoryId,
      brandId,
      attributeValues = [],
      promotionIds = [],
      ...data
    } = parsedInput;

    try {
      const product = await prisma.product.create({
        data: {
          ...data,
          shopId,
          categoryId: categoryId || null,
          brandId: brandId || null,
          attributeValues: {
            create: attributeValues.map((av) => ({
              attributeValueId: av.attributeValueId,
              extraPrice: av.extraPrice ?? null,
            })),
          },
          promotions:
            promotionIds.length > 0
              ? {
                  connect: promotionIds.map((id) => ({ id })),
                }
              : undefined,
        },
      });

      revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
      return { product };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new Error("A product with this slug already exists.");
      }
      throw err;
    }
  });

export const updateProduct = shopOwnerActionClient
  .inputSchema(updateProductSchema)
  .action(async ({ parsedInput, ctx }) => {
    const {
      id,
      shopId,
      categoryId,
      brandId,
      attributeValues = [],
      promotionIds = [],
      ...data
    } = parsedInput;

    try {
      // Execute in transaction to sync relationships cleanly
      const updated = await prisma.$transaction(async (tx) => {
        // Clear old attribute values
        await tx.productAttributeValue.deleteMany({
          where: { productId: id },
        });

        const product = await tx.product.update({
          where: { id, shopId },
          data: {
            ...data,
            categoryId: categoryId || null,
            brandId: brandId || null,
            attributeValues: {
              create: attributeValues.map((av) => ({
                attributeValueId: av.attributeValueId,
                extraPrice: av.extraPrice ?? null,
              })),
            },
            promotions: {
              set: promotionIds.map((pId) => ({ id: pId })),
            },
          },
        });

        return product;
      });

      revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
      revalidatePath(`/${ctx.shop.slug}/dashboard/products/${id}/edit`);
      return { product: updated };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          throw new Error("A product with this slug already exists.");
        }
        if (err.code === "P2025") {
          throw new Error("Product not found.");
        }
      }
      throw err;
    }
  });

export const deleteProduct = shopOwnerActionClient
  .inputSchema(deleteProductSchema)
  .action(async ({ parsedInput, ctx }) => {
    await prisma.product.delete({
      where: { id: parsedInput.id, shopId: ctx.shop.id },
    });
    revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
    return { success: true };
  });

export const toggleProductStatus = shopOwnerActionClient
  .inputSchema(toggleProductStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    const updated = await prisma.product.update({
      where: { id: parsedInput.id, shopId: ctx.shop.id },
      data: { isActive: parsedInput.isActive },
    });
    revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
    return { product: updated };
  });
