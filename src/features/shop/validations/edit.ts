import { z } from "zod";

export const updateShopSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters").max(50),
  description: z.string().max(500, "Keep it under 500 characters").optional(),
  contactEmail: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  contactPhones: z
    .array(
      z
        .string()
        .refine(
          (v) => v === "" || /^[+]?[\d\s()-]{7,20}$/.test(v),
          "Enter a valid phone number",
        ),
    )
    .max(5, "You can add up to 5 phone numbers")
    .default([]),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
});

export type UpdateShopInput = z.infer<typeof updateShopSchema>;
