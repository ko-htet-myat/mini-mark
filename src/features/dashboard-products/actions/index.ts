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
import type { CreateProductInput } from "../validations";

const serializeDecimal = (value: Prisma.Decimal | null): number | null =>
  value != null ? Number(value) : null;

const serializeProduct = <
  T extends {
    price: Prisma.Decimal;
    compareAtPrice: Prisma.Decimal | null;
    costPrice: Prisma.Decimal | null;
  },
>(
  product: T,
) => ({
  ...product,
  price: Number(product.price),
  compareAtPrice: serializeDecimal(product.compareAtPrice),
  costPrice: serializeDecimal(product.costPrice),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determines whether the shop category uses the variant matrix engine.
 * RESTAURANT uses addons and bypasses SKUs; everything else uses variants.
 */
function isRestaurantCategory(shopCategory: string) {
  return shopCategory === "RESTAURANT";
}

/**
 * Categories that store key-value specifications in Product.specifications.
 */
function usesSpecifications(shopCategory: string) {
  return ["ELECTRONICS", "AUTOMOTIVE", "HOME_GARDEN", "BEAUTY"].includes(
    shopCategory,
  );
}

function productDataFromInput(input: CreateProductInput, shopCategory: string) {
  const { basicInfo, pricingInventory, merchandisingSeo } = input;

  return {
    name: basicInfo.name,
    slug: basicInfo.slug,
    description: basicInfo.description || null,
    price: pricingInventory.price,
    compareAtPrice: pricingInventory.compareAtPrice ?? null,
    costPrice: pricingInventory.costPrice ?? null,
    uom: pricingInventory.uom,
    barcode: pricingInventory.barcode || null,
    minOrderQuantity: pricingInventory.minOrderQuantity ?? null,
    maxOrderQuantity: pricingInventory.maxOrderQuantity ?? null,
    isOutOfStock: pricingInventory.isOutOfStock,
    imageUrl: basicInfo.imageUrl || null,
    youtubeUrl: basicInfo.youtubeUrl || null,
    noticeText: merchandisingSeo.noticeText || null,
    isActive: merchandisingSeo.isActive,
    isFeatured: merchandisingSeo.isFeatured,
    isBestSellerItem:
      ["FASHION", "BOOKS_STATIONERY", "ELECTRONICS", "BEAUTY"].includes(
        shopCategory,
      ) && merchandisingSeo.isBestSellerItem,
    isCollection: shopCategory === "FASHION" && merchandisingSeo.isCollection,
    isSpecialMenu:
      shopCategory === "RESTAURANT" && merchandisingSeo.isSpecialMenu,
    metaTitle: merchandisingSeo.metaTitle || null,
    metaDescription: merchandisingSeo.metaDescription || null,
    categoryId: basicInfo.categoryId || null,
    brandId: basicInfo.brandId || null,
  };
}

/**
 * Build the variant creation payload for a prisma.$transaction.
 * If the shop is RESTAURANT or hasVariants is false, creates a single default variant.
 */
function buildVariantCreates(
  input: Pick<CreateProductInput["categoryEngine"], "hasVariants" | "variants">,
  shopCategory: string,
): Prisma.ProductVariantCreateWithoutProductInput[] {
  const isRestaurant = isRestaurantCategory(shopCategory);

  if (
    isRestaurant ||
    !input.hasVariants ||
    (input.variants ?? []).length === 0
  ) {
    // One default variant so checkout can always resolve price/stock via variantId
    return [{ stock: 0, isActive: true }];
  }

  return (input.variants ?? []).map((v) => ({
    sku: v.sku || null,
    price: v.price != null ? v.price : null,
    compareAtPrice: v.compareAtPrice != null ? v.compareAtPrice : null,
    costPrice: v.costPrice != null ? v.costPrice : null,
    stock: v.stock ?? 0,
    imageUrl: v.imageUrl || null,
    allowBackorder: v.allowBackorder ?? false,
    uom: v.uom || null,
    uomValue: v.uomValue != null ? v.uomValue : null,
    isActive: v.isActive ?? true,
    attributeValues: {
      create: (v.attributeValueIds ?? []).map((attributeValueId) => ({
        attributeValueId,
      })),
    },
  }));
}

function uniqueErrorMessage(err: Prisma.PrismaClientKnownRequestError) {
  const target = Array.isArray(err.meta?.target)
    ? err.meta.target.join(",")
    : String(err.meta?.target ?? "");

  if (target.includes("barcode")) {
    return "A product with this barcode already exists.";
  }

  return "A product with this slug already exists.";
}

// ─── createProduct ────────────────────────────────────────────────────────────

export const createProduct = shopOwnerActionClient
  .inputSchema(createProductSchema)
  .action(async ({ parsedInput, ctx }) => {
    const shopCategory = ctx.shop.shopCategory;
    const isRestaurant = isRestaurantCategory(shopCategory);
    const { categoryEngine } = parsedInput;
    const effectiveHasVariants = isRestaurant
      ? false
      : categoryEngine.hasVariants;

    try {
      const product = await prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            ...productDataFromInput(parsedInput, shopCategory),
            shopId: parsedInput.shopId,
            hasVariants: effectiveHasVariants,
            specifications:
              !isRestaurant &&
              usesSpecifications(shopCategory) &&
              Object.keys(categoryEngine.specifications ?? {}).length > 0
                ? categoryEngine.specifications
                : undefined,
            addons:
              isRestaurant && categoryEngine.addons?.length
                ? categoryEngine.addons
                : undefined,
            variants: {
              create: buildVariantCreates(
                {
                  hasVariants: effectiveHasVariants,
                  variants: categoryEngine.variants,
                },
                shopCategory,
              ),
            },
          },
        });
        return created;
      });

      revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
      return { product: serializeProduct(product) };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new Error(uniqueErrorMessage(err));
      }
      throw err;
    }
  });

// ─── updateProduct ────────────────────────────────────────────────────────────

export const updateProduct = shopOwnerActionClient
  .inputSchema(updateProductSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, categoryEngine } = parsedInput;
    const shopCategory = ctx.shop.shopCategory;
    const isRestaurant = isRestaurantCategory(shopCategory);
    const effectiveHasVariants = isRestaurant
      ? false
      : categoryEngine.hasVariants;

    try {
      const updated = await prisma.$transaction(async (tx) => {
        // Verify ownership before mutating
        const existing = await tx.product.findUnique({
          where: { id },
          select: { shopId: true },
        });
        if (!existing || existing.shopId !== ctx.shop.id) {
          throw new Error("Product not found.");
        }

        // Delete all variants wholesale (cascades to attributeValues via onDelete: Cascade)
        await tx.productVariant.deleteMany({ where: { productId: id } });

        const product = await tx.product.update({
          where: { id, shopId: parsedInput.shopId },
          data: {
            ...productDataFromInput(parsedInput, shopCategory),
            hasVariants: effectiveHasVariants,
            specifications:
              !isRestaurant &&
              usesSpecifications(shopCategory) &&
              Object.keys(categoryEngine.specifications ?? {}).length > 0
                ? categoryEngine.specifications
                : Prisma.DbNull,
            addons:
              isRestaurant && categoryEngine.addons?.length
                ? categoryEngine.addons
                : Prisma.DbNull,
            variants: {
              create: buildVariantCreates(
                {
                  hasVariants: effectiveHasVariants,
                  variants: categoryEngine.variants,
                },
                shopCategory,
              ),
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
          throw new Error(uniqueErrorMessage(err));
        }
        if (err.code === "P2025") {
          throw new Error("Product not found.");
        }
      }
      throw err;
    }
  });

// ─── deleteProduct ────────────────────────────────────────────────────────────

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

// ─── toggleProductStatus ──────────────────────────────────────────────────────

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

// ─── duplicateProduct ─────────────────────────────────────────────────────────

export const duplicateProduct = shopOwnerActionClient
  .inputSchema(duplicateProductSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const shopCategory = ctx.shop.shopCategory;

      const original = await prisma.product.findUnique({
        where: { id: parsedInput.id, shopId: ctx.shop.id },
        include: {
          variants: {
            include: {
              attributeValues: true,
            },
          },
          promotions: {
            select: { id: true },
          },
        },
      });

      if (!original) {
        throw new Error("Product not found");
      }

      const timestamp = Date.now().toString().slice(-4);
      const newSlug = `${original.slug}-copy-${timestamp}`;
      const newName = `${original.name} (Copy)`;

      const duplicated = await prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: {
            shopId: original.shopId,
            name: newName,
            slug: newSlug,
            description: original.description,
            price: original.price,
            compareAtPrice: original.compareAtPrice,
            costPrice: original.costPrice,
            uom: original.uom,
            barcode: original.barcode
              ? `${original.barcode}-copy-${timestamp}`
              : null,
            minOrderQuantity: original.minOrderQuantity,
            maxOrderQuantity: original.maxOrderQuantity,
            isOutOfStock: original.isOutOfStock,
            imageUrl: original.imageUrl,
            youtubeUrl: original.youtubeUrl,
            noticeText: original.noticeText,
            isActive: false,
            isFeatured: original.isFeatured,
            isBestSellerItem: original.isBestSellerItem,
            isCollection: original.isCollection,
            isSpecialMenu: original.isSpecialMenu,
            metaTitle: original.metaTitle,
            metaDescription: original.metaDescription,
            hasVariants: original.hasVariants,
            categoryId: original.categoryId,
            brandId: original.brandId,
            specifications: original.specifications ?? undefined,
            addons: original.addons ?? undefined,
            variants: {
              create: buildVariantCreates(
                {
                  hasVariants: original.hasVariants,
                  variants: original.variants.map((v) => ({
                    sku: v.sku ? `${v.sku}-copy-${timestamp}` : undefined,
                    price: v.price ? Number(v.price) : undefined,
                    compareAtPrice: v.compareAtPrice
                      ? Number(v.compareAtPrice)
                      : undefined,
                    costPrice: v.costPrice ? Number(v.costPrice) : undefined,
                    stock: v.stock,
                    imageUrl: v.imageUrl ?? undefined,
                    allowBackorder: v.allowBackorder,
                    uom: v.uom ?? undefined,
                    uomValue: v.uomValue ? Number(v.uomValue) : undefined,
                    isActive: v.isActive,
                    attributeValueIds: v.attributeValues.map(
                      (av) => av.attributeValueId,
                    ),
                  })),
                },
                shopCategory,
              ),
            },
            promotions:
              original.promotions.length > 0
                ? {
                    connect: original.promotions.map((p) => ({ id: p.id })),
                  }
                : undefined,
          },
        });

        return created;
      });

      revalidatePath(`/${ctx.shop.slug}/dashboard/products`);
      return { success: true, newProductId: duplicated.id };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new Error(uniqueErrorMessage(err));
      }
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new Error("Product not found.");
      }
      throw err;
    }
  });
