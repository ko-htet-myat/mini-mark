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
      hasVariants,
      variants = [],
      promotionIds = [],
      ...data
    } = parsedInput;

    try {
      const product = await prisma.product.create({
        data: {
          ...data,
          shopId,
          hasVariants,
          categoryId: categoryId || null,
          brandId: brandId || null,
          variants: hasVariants
            ? {
                create: variants.map((v) => ({
                  sku: v.sku || null,
                  price: v.price ?? null,
                  compareAtPrice: v.compareAtPrice ?? null,
                  stock: v.stock ?? 0,
                  imageUrl: v.imageUrl || null,
                  isActive: v.isActive ?? true,
                  attributeValues: {
                    create: v.attributeValues.map((av) => ({
                      attributeValueId: av.attributeValueId,
                    })),
                  },
                })),
              }
            : undefined,
          promotions:
            promotionIds.length > 0
              ? {
                  connect: promotionIds.map((id) => ({ id })),
                }
              : undefined,
        },
      });

      revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
      return {
        product: {
          ...product,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : null,
        },
      };
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
      hasVariants,
      variants = [],
      promotionIds = [],
      ...data
    } = parsedInput;

    try {
      const updated = await prisma.$transaction(async (tx) => {
        // Delete old variants (cascades to attributeValues via onDelete)
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        const product = await tx.product.update({
          where: { id, shopId },
          data: {
            ...data,
            hasVariants,
            categoryId: categoryId || null,
            brandId: brandId || null,
            variants: hasVariants
              ? {
                  create: variants.map((v) => ({
                    sku: v.sku || null,
                    price: v.price ?? null,
                    compareAtPrice: v.compareAtPrice ?? null,
                    stock: v.stock ?? 0,
                    imageUrl: v.imageUrl || null,
                    isActive: v.isActive ?? true,
                    attributeValues: {
                      create: v.attributeValues.map((av) => ({
                        attributeValueId: av.attributeValueId,
                      })),
                    },
                  })),
                }
              : undefined,
            promotions: {
              set: promotionIds.map((pId) => ({ id: pId })),
            },
          },
        });

        return product;
      });

      revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
      revalidatePath(`/${ctx.shop.slug}/dashboard/products/${id}/edit`);
      return {
        product: {
          ...updated,
          price: Number(updated.price),
          compareAtPrice: updated.compareAtPrice
            ? Number(updated.compareAtPrice)
            : null,
        },
      };
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
    return {
      product: {
        ...updated,
        price: Number(updated.price),
        compareAtPrice: updated.compareAtPrice
          ? Number(updated.compareAtPrice)
          : null,
      },
    };
  });
