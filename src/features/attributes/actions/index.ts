"use server";

import { shopOwnerActionClient } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { createAttributeSchema, updateAttributeSchema } from "../validations";
import prisma from "@/lib/prisma";

export const createAttribute = shopOwnerActionClient
  .inputSchema(createAttributeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { shopId, values, ...data } = parsedInput;

    try {
      const attribute = await prisma.attribute.create({
        data: {
          ...data,
          shopId,
          values: {
            create: values.map((val) => ({ value: val })),
          },
        },
      });
      revalidatePath(`/${ctx.shop.slug}/dashboard/attributes`);
      return { attribute };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new Error("An attribute with this slug or value already exists.");
      }
      throw err;
    }
  });

export const updateAttribute = shopOwnerActionClient
  .inputSchema(updateAttributeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, values, ...data } = parsedInput;

    try {
      const existingValues = await prisma.attributeValue.findMany({
        where: { attributeId: id },
      });
      const existingValueStrings = existingValues.map((ev) => ev.value);

      const valuesToAdd = values.filter(
        (v) => !existingValueStrings.includes(v),
      );
      const valuesToRemove = existingValues.filter(
        (ev) => !values.includes(ev.value),
      );

      const updated = await prisma.attribute.update({
        where: { id },
        data: {
          ...data,
          values: {
            create: valuesToAdd.map((val) => ({ value: val })),
            deleteMany: {
              id: { in: valuesToRemove.map((ev) => ev.id) },
            },
          },
        },
      });
      revalidatePath(`/${ctx.shop.slug}/dashboard/attributes`);
      return { attribute: updated };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002")
          throw new Error(
            "An attribute with this slug or value already exists.",
          );
        if (err.code === "P2025") throw new Error("Attribute not found.");
      }
      throw err;
    }
  });

export const deleteAttribute = shopOwnerActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    await prisma.attribute.delete({
      where: { id: parsedInput.id, shopId: ctx.shop.id },
    });
    revalidatePath(`/${ctx.shop.slug}/dashboard/attributes`);
    return { success: true };
  });
