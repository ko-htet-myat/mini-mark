"use server";

import { shopOwnerActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  toggleProductStatusSchema,
  duplicateProductSchema,
} from "../validations";
import prisma from "@/lib/prisma";

const serializeDecimal = (value: Prisma.Decimal | null): number | null =>
  value != null ? Number(value) : null;

const serializeProduct = <
  T extends { price: Prisma.Decimal; compareAtPrice: Prisma.Decimal | null },
>(
  product: T,
) => ({
  ...product,
  price: Number(product.price),
  compareAtPrice: serializeDecimal(product.compareAtPrice),
});

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
      return { product: serializeProduct(product) };
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
      return { product: serializeProduct(updated) };
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
    try {
      await prisma.product.delete({
        where: { id: parsedInput.id, shopId: ctx.shop.id },
      });
      revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
      return { success: true };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new Error("Product not found.");
      }
      throw err;
    }
  });

export const toggleProductStatus = shopOwnerActionClient
  .inputSchema(toggleProductStatusSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const updated = await prisma.product.update({
        where: { id: parsedInput.id, shopId: ctx.shop.id },
        data: { isActive: parsedInput.isActive },
      });
      revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
      return { product: serializeProduct(updated) };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new Error("Product not found.");
      }
      throw err;
    }
  });

export const duplicateProduct = shopOwnerActionClient
  .inputSchema(duplicateProductSchema)
  .action(async ({ parsedInput, ctx }) => {
    const original = await prisma.product.findUnique({
      where: { id: parsedInput.id, shopId: ctx.shop.id },
      include: {
        variants: {
          include: {
            attributeValues: true,
          },
        },
        promotions: true,
      },
    });

    if (!original) {
      throw new Error("Product not found");
    }

    const timestamp = Date.now().toString().slice(-4);
    const newSlug = `${original.slug}-copy-${timestamp}`;
    const newName = `${original.name} (Copy)`;

    const duplicated = await prisma.product.create({
      data: {
        shopId: original.shopId,
        name: newName,
        slug: newSlug,
        description: original.description,
        price: original.price,
        compareAtPrice: original.compareAtPrice,
        imageUrl: original.imageUrl,
        youtubeUrl: original.youtubeUrl,
        isActive: false,
        hasVariants: original.hasVariants,
        categoryId: original.categoryId,
        brandId: original.brandId,
        variants: original.hasVariants
          ? {
              create: original.variants.map((v) => ({
                sku: v.sku ? `${v.sku}-copy-${timestamp}` : null,
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                stock: v.stock,
                imageUrl: v.imageUrl,
                isActive: v.isActive,
                attributeValues: {
                  create: v.attributeValues.map((av) => ({
                    attributeValueId: av.attributeValueId,
                  })),
                },
              })),
            }
          : undefined,
        promotions:
          original.promotions.length > 0
            ? {
                connect: original.promotions.map((p) => ({ id: p.id })),
              }
            : undefined,
      },
    });

    revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
    return { success: true, newProductId: duplicated.id };
  });
