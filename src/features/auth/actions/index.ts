"use server";

import { isAPIError } from "better-auth/api";
import { actionClient } from "@/lib/safe-action";
import { auth } from "@/lib/auth";
import { loginSchema, signupSchema } from "../validations";
import prisma from "@/lib/prisma";

export const signupAction = actionClient
  .inputSchema(signupSchema)
  .action(async ({ parsedInput }) => {
    try {
      await auth.api.signUpEmail({
        body: {
          name: parsedInput.name,
          email: parsedInput.email,
          password: parsedInput.password,
        },
      });
      return { success: true };
    } catch (err) {
      if (isAPIError(err)) {
        throw new Error(err.message);
      }
      throw err;
    }
  });

export const loginAction = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }) => {
    let result;
    try {
      result = await auth.api.signInEmail({
        body: {
          email: parsedInput.email,
          password: parsedInput.password,
        },
      });
    } catch (err) {
      if (isAPIError(err)) {
        throw new Error(err.message);
      }
      throw err;
    }

    const shop = await prisma.shop.findUnique({
      where: { ownerId: result.user.id },
      select: { slug: true },
    });

    return { shopSlug: shop?.slug ?? null };
  });
