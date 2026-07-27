import { z } from "zod";

export const brandFormSchema = z.object({
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
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

export const createBrandSchema = brandFormSchema.extend({ shopId: z.string() });
export const updateBrandSchema = brandFormSchema.extend({ id: z.string() });
