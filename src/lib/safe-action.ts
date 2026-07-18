import { createSafeActionClient } from "next-safe-action";
import { betterAuth } from "@next-safe-action/adapter-better-auth";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export const actionClient = createSafeActionClient();

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
