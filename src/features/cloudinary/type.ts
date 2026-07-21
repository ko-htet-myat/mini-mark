import { z } from "zod";

export const deleteCloudinaryImageSchema = z.object({
  publicId: z.string().min(1),
  resourceType: z.enum(["image", "video", "raw"]).default("image"),
});
