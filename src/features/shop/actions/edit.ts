"use server";

import { actionClient } from "@/lib/safe-action";
import { updateShopSchema } from "../validations/edit";
import { getSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";

export const updateShopAction = actionClient
  .inputSchema(updateShopSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const shop = await prisma.shop.findUnique({
      where: { ownerId: session.user.id },
    });
    if (!shop) throw new Error("Shop not found");

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.shop.update({
        where: { id: shop.id },
        data: {
          name: parsedInput.name,
          currency: parsedInput.currency,
          shopCategory: parsedInput.shopCategory,
          description: parsedInput.description || null,
          contactEmail: parsedInput.contactEmail || null,
          contactPhones: parsedInput.contactPhones.filter(Boolean), // drop empty strings from dynamic fields
          region: parsedInput.region || null,
          division: parsedInput.division || null,
          township: parsedInput.township || null,
          address: parsedInput.address || null,
          logoUrl: parsedInput.logoUrl || null,
          bannerUrl: parsedInput.bannerUrl || null,
        },
      });

      await writeAuditLog(tx, {
        actorId: session.user.id,
        actorName: session.user.name,
        action: "SHOP_UPDATED",
        entityId: result.id,
        shopId: result.id,
        shopSlug: result.slug,
        shopName: result.name,
      });

      await Promise.all(
        parsedInput.operatingHours.map((hours) =>
          tx.shopOperatingHours.upsert({
            where: {
              shopId_dayOfWeek: {
                shopId: shop.id,
                dayOfWeek: hours.dayOfWeek,
              },
            },
            create: {
              shopId: shop.id,
              dayOfWeek: hours.dayOfWeek,
              isClosed: hours.isClosed,
              openTime: hours.isClosed ? null : hours.openTime,
              closeTime: hours.isClosed ? null : hours.closeTime,
            },
            update: {
              isClosed: hours.isClosed,
              openTime: hours.isClosed ? null : hours.openTime,
              closeTime: hours.isClosed ? null : hours.closeTime,
            },
          }),
        ),
      );

      return result;
    });

    revalidatePath(`/${updated.slug}`);
    revalidatePath(`/${updated.slug}/dashboard`);
    revalidatePath(`/${updated.slug}/dashboard/settings`);

    return { shop: updated };
  });
