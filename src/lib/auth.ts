import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/env";

import disposableDomains from "disposable-email-domains";

const blockedDomains = new Set(disposableDomains);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: env.BETTER_AUTH_URL,
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const domain = user.email?.split("@")[1]?.toLowerCase();

          if (!domain || blockedDomains.has(domain)) {
            throw new APIError("UNPROCESSABLE_ENTITY", {
              message: "Please use a permanent email address to sign up.",
            });
          }
        },
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes — session data is cached in the cookie, skipping the DB
    },
  },
  rateLimit: {
    window: 60,
    max: 5,
  },
  trustedOrigins: [env.NEXT_PUBLIC_BASE_URL],
  plugins: [nextCookies()],
});
