import { z } from "zod";

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, schema.optional());

const variantAttributeValueSchema = z.object({
  attributeValueId: z.string().min(1),
});

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z
    .string()
    .trim()
    .max(64, "SKU is too long")
    .optional()
    .or(z.literal("")),
  price: optionalNumber(z.number().positive("Price must be greater than 0")),
  compareAtPrice: optionalNumber(z.number().positive("Must be greater than 0")),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock can't be negative")
    .default(0),
  imageUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
  attributeValues: z.array(variantAttributeValueSchema).default([]),
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

  imageUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  youtubeUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().default(true),

  categoryId: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),

  hasVariants: z.boolean().default(false),
  variants: z.array(variantSchema).default([]),

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
