import { z } from "zod";

const unitOfMeasureSchema = z.enum([
  "PCS",
  "KG",
  "G",
  "L",
  "ML",
  "PACK",
  "BOX",
  "DOZEN",
  "METER",
  "CM",
  "SET",
]);

export const UNIT_OF_MEASURE_OPTIONS = unitOfMeasureSchema.options;

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  }, schema.optional());

const nullableString = (maxLength: number, message: string) =>
  z.string().trim().max(maxLength, message).optional().or(z.literal(""));

export const variantSchema = z.object({
  id: z.string().optional(),
  sku: nullableString(64, "SKU is too long"),
  price: optionalNumber(z.number().positive("Price must be greater than 0")),
  compareAtPrice: optionalNumber(z.number().positive("Must be greater than 0")),
  costPrice: optionalNumber(z.number().min(0, "Cost price can't be negative")),
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
  allowBackorder: z.boolean().default(false),
  uom: unitOfMeasureSchema.optional().or(z.literal("")),
  uomValue: optionalNumber(
    z.number().positive("Unit value must be greater than 0"),
  ),
  isActive: z.boolean().default(true),
  attributeValueIds: z.array(z.string().min(1)).default([]),
});

export type VariantInput = z.infer<typeof variantSchema>;

const addonOptionSchema = z.object({
  name: z.string().trim().min(1, "Option name is required"),
  price: z.coerce.number().min(0, "Price can't be negative").default(0),
});

const addonGroupSchema = z.object({
  groupName: z.string().trim().min(1, "Group name is required"),
  minSelect: z.coerce.number().int().min(0).default(0),
  maxSelect: z.coerce.number().int().min(1).default(1),
  options: z.array(addonOptionSchema).default([{ name: "", price: 0 }]),
});

const basicInfoSchema = z.object({
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
  description: nullableString(2000, "Description is too long"),
  categoryId: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
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
});

const pricingInventorySchema = z
  .object({
    price: z.coerce
      .number({ message: "Price is required" })
      .positive("Price must be greater than 0"),
    compareAtPrice: optionalNumber(
      z.number().positive("Must be greater than 0"),
    ),
    costPrice: optionalNumber(
      z.number().min(0, "Cost price can't be negative"),
    ),
    uom: unitOfMeasureSchema.default("PCS"),
    barcode: nullableString(64, "Barcode is too long"),
    minOrderQuantity: optionalNumber(
      z.number().int("Minimum order quantity must be a whole number").min(1),
    ),
    maxOrderQuantity: optionalNumber(
      z.number().int("Maximum order quantity must be a whole number").min(1),
    ),
    isOutOfStock: z.boolean().default(false),
  })
  .refine(
    (value) =>
      value.minOrderQuantity == null ||
      value.maxOrderQuantity == null ||
      value.maxOrderQuantity >= value.minOrderQuantity,
    {
      message: "Maximum order quantity must be at least the minimum",
      path: ["maxOrderQuantity"],
    },
  );

const categoryEngineSchema = z.object({
  shopCategory: z.string().min(1),
  hasVariants: z.boolean().default(false),
  variants: z.array(variantSchema).default([]),
  selectedAttributeIds: z.array(z.string()).default([]),
  specifications: z.record(z.string(), z.string()).default({}),
  addons: z.array(addonGroupSchema).default([]),
});

const merchandisingSeoSchema = z.object({
  isFeatured: z.boolean().default(false),
  isBestSellerItem: z.boolean().default(false),
  isCollection: z.boolean().default(false),
  isSpecialMenu: z.boolean().default(false),
  isActive: z.boolean().default(true),
  noticeText: nullableString(500, "Notice text is too long"),
  metaTitle: nullableString(120, "Meta title is too long"),
  metaDescription: nullableString(300, "Meta description is too long"),
});

export const createProductSchema = z.object({
  shopId: z.string().min(1),
  basicInfo: basicInfoSchema,
  pricingInventory: pricingInventorySchema,
  categoryEngine: categoryEngineSchema,
  merchandisingSeo: merchandisingSeoSchema,
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

export const duplicateProductSchema = z.object({
  id: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UnitOfMeasureInput = z.infer<typeof unitOfMeasureSchema>;
