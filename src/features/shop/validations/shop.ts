import { z } from "zod";
import { Currency, ShopCategoryType } from "@/generated/prisma/enums";

export const RESERVED_SLUGS = [
  "sign-in",
  "sign-up",
  "logout",
  "dashboard",
  "api",
  "admin",
  "about",
  "pricing",
  "contact",
  "settings",
  "help",
  "support",
  "terms",
  "privacy",
  "blog",
  "docs",
  "_next",
  "static",
  "public",
];

export const createShopSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters").max(50),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens")
    .refine((val) => !RESERVED_SLUGS.includes(val), {
      message: "This slug is reserved, please choose another",
    }),
  currency: z.nativeEnum(Currency).default("MMK"),
  shopCategory: z.nativeEnum(ShopCategoryType, {
    error: "Please select a valid category",
  }),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
