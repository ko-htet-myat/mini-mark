import { z } from "zod";

export const attributeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase letters, numbers, and hyphens only",
    ),
  values: z
    .array(z.string().min(1, "At least one value is required"))
    .min(1, "At least one value is required")
    .max(50, "Maximum 50 values allowed"),
});

export type AttributeFormValues = z.infer<typeof attributeFormSchema>;

export const createAttributeSchema = attributeFormSchema.extend({
  shopId: z.string(),
});
export const updateAttributeSchema = attributeFormSchema.extend({
  id: z.string(),
});
