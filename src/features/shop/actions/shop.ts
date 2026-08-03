"use server";

import { authClient } from "@/lib/safe-action";
import { returnValidationErrors } from "next-safe-action";
import prisma from "@/lib/prisma";
import { createShopSchema } from "../validations/shop";
import { writeAuditLog } from "@/lib/audit";

export const createShopAction = authClient
  .inputSchema(createShopSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = ctx.auth.user;
    const existing = await prisma.shop.findUnique({
      where: { ownerId: user.id },
    });
    if (existing) throw new Error("You already have a shop");

    const slugTaken = await prisma.shop.findUnique({
      where: { slug: parsedInput.slug },
    });

    if (slugTaken) {
      // maps this error directly onto the `slug` field in the form
      returnValidationErrors(createShopSchema, {
        slug: { _errors: ["This shop URL is already taken"] },
      });
    }

    const shop = await prisma.$transaction(async (tx) => {
      const created = await tx.shop.create({
        data: {
          name: parsedInput.name,
          slug: parsedInput.slug,
          currency: parsedInput.currency,
          ownerId: user.id,
        },
      });

      await writeAuditLog(tx, {
        actorId: user.id,
        actorName: user.name,
        action: "SHOP_CREATED",
        entityId: created.id,
        shopId: created.id,
        shopSlug: created.slug,
        shopName: created.name,
      });

      return created;
    });

    return { shop };
  });
