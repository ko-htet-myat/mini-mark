import { z } from "zod";
import {
  Currency,
  DayOfWeek,
  ShopCategoryType,
} from "@/generated/prisma/enums";

const timeSchema = z
  .string()
  .refine((value) => value === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(value), {
    message: "Use HH:mm time format",
  });

const operatingHourSchema = z
  .object({
    dayOfWeek: z.nativeEnum(DayOfWeek),
    isClosed: z.boolean(),
    openTime: timeSchema,
    closeTime: timeSchema,
  })
  .refine(
    (value) =>
      value.isClosed || (value.openTime !== "" && value.closeTime !== ""),
    {
      message: "Open and close times are required unless the shop is closed",
      path: ["openTime"],
    },
  );

export const updateShopSchema = z.object({
  name: z.string().min(2, "Shop name must be at least 2 characters").max(50),
  currency: z.nativeEnum(Currency),
  shopCategory: z.nativeEnum(ShopCategoryType),
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
  region: z.string().optional().or(z.literal("")),
  division: z.string().optional().or(z.literal("")),
  township: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  operatingHours: z.array(operatingHourSchema).default([]),
});

export type UpdateShopInput = z.infer<typeof updateShopSchema>;
