"use server";

import { authClient } from "@/lib/safe-action";
import { deleteCloudinaryImageSchema } from "./type";
import { cloudinary } from "./config";

export const deleteCloudinaryImageAction = authClient
  .schema(deleteCloudinaryImageSchema)
  .action(async ({ parsedInput: { publicId, resourceType } }) => {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    // "not found" means the asset was already gone — treat as success so
    // callers don't need to special-case it.
    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Failed to delete Cloudinary asset: ${result.result}`);
    }

    return { success: true, result: result.result as string };
  });
