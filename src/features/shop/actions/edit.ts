"use server";

import { actionClient } from "@/lib/safe-action";
import { updateShopSchema } from "../validations/edit";
import { getSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const updateShopAction = actionClient
  .inputSchema(updateShopSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const shop = await prisma.shop.findUnique({
      where: { ownerId: session.user.id },
    });
    if (!shop) throw new Error("Shop not found");

    const updated = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        name: parsedInput.name,
        description: parsedInput.description || null,
        contactEmail: parsedInput.contactEmail || null,
        contactPhones: parsedInput.contactPhones.filter(Boolean), // drop empty strings from dynamic fields
        logoUrl: parsedInput.logoUrl || null,
        bannerUrl: parsedInput.bannerUrl || null,
      },
    });

    revalidatePath(`/${updated.slug}`);
    revalidatePath(`/${updated.slug}/dashboard`);

    return { shop: updated };
  });
