"use server";

import { headers } from "next/headers";
import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth";
import { returnValidationErrors } from "next-safe-action";
import prisma from "@/lib/prisma";
import { createShopSchema } from "../validations/shop";

export const createShopAction = actionClient
  .inputSchema(createShopSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Not authenticated");

    const existing = await prisma.shop.findUnique({
      where: { ownerId: session.user.id },
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

    const shop = await prisma.shop.create({
      data: {
        name: parsedInput.name,
        slug: parsedInput.slug,
        ownerId: session.user.id,
      },
    });

    return { shop };
  });
