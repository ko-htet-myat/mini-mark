import { z } from "zod";

export const promotionFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase letters, numbers, and hyphens only",
    ),
  description: z.string().max(500).optional().or(z.literal("")),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.coerce.number().min(0, "Discount value must be positive"),
  code: z.string().max(50).optional().or(z.literal("")),
  startsAt: z.date().optional().nullable(),
  endsAt: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;

export const createPromotionSchema = promotionFormSchema.extend({
  shopId: z.string(),
});
export const updatePromotionSchema = promotionFormSchema.extend({
  id: z.string(),
});
