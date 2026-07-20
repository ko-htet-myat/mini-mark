import { z } from "zod";

export const categoryFormSchema = z.object({
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
  imageUrl: z.string().url().optional().or(z.literal("")),
  parentId: z.string().optional().or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const createCategorySchema = categoryFormSchema.extend({
  shopId: z.string(),
});
export const updateCategorySchema = categoryFormSchema.extend({
  id: z.string(),
});
