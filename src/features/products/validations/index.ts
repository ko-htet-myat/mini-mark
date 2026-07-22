import { z } from "zod";
import { ProductStatus } from "@/generated/prisma/enums";

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, schema.optional());

const attributeValueSchema = z.object({
  attributeValueId: z.string().min(1),
  extraPrice: z
    .number()
    .positive("Extra price must be greater than 0")
    .optional()
    .nullable(),
});

export const createProductSchema = z.object({
  shopId: z.string().min(1),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(120, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only",
    ),

  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional()
    .or(z.literal("")),

  price: z.coerce
    .number({ message: "Price is required" })
    .positive("Price must be greater than 0"),

  compareAtPrice: optionalNumber(z.number().positive("Must be greater than 0")),

  sku: z
    .string()
    .trim()
    .max(64, "SKU is too long")
    .optional()
    .or(z.literal("")),

  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock can't be negative")
    .default(0),

  images: z.array(z.string().url("Each image must be a valid URL")).default([]),

  youtubeUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  status: z.nativeEnum(ProductStatus).default("IN_STOCK"),

  isActive: z.boolean().default(true),

  categoryId: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),

  attributeValues: z.array(attributeValueSchema).default([]),
  promotionIds: z.array(z.string()).default([]),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.string().min(1),
});

export const deleteProductSchema = z.object({
  id: z.string().min(1),
});

export const toggleProductStatusSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
