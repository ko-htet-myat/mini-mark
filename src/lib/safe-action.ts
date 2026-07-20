import { createSafeActionClient } from "next-safe-action";
import { betterAuth } from "@next-safe-action/adapter-better-auth";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import z from "zod";

export const actionClient = createSafeActionClient({
  handleServerError: (e) => {
    if (e instanceof Error) {
      return e.message;
    }
    return "Something went wrong while executing the operation.";
  },
});

export const authClient = actionClient.use(
  betterAuth(auth, {
    authorize: ({ authData, next }) => {
      if (!authData) {
        redirect("/sign-in");
      }
      return next({ ctx: { auth: authData } });
    },
  }),
);

export const shopOwnerActionClient = authClient
  .bindArgsSchemas([z.object({ shop: z.string() })])
  .use(async ({ next, ctx, bindArgsClientInputs }) => {
    const [{ shop: shopSlug }] = bindArgsClientInputs as [{ shop: string }];

    const shop = await getShopBySlug(shopSlug);

    if (!shop || shop.ownerId !== ctx.auth.user.id) {
      throw new Error("Forbidden: you do not own this shop");
    }

    return next({ ctx: { ...ctx, shop } });
  });
