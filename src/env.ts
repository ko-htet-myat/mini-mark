import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  /**
   * Server-side env vars. Never exposed to the client bundle.
   */
  server: {
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    DATABASE_URL: z.string().url(),

    CLOUDINARY_API_SECRET: z.string().min(1),
  },

  /**
   * Client-side env vars. MUST be prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url(),

    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
    NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().min(1),
    NEXT_PUBLIC_CLOUDINARY_SECURE_DISTRIBUTION: z.string().min(1).optional(),
    NEXT_PUBLIC_CLOUDINARY_PRIVATE_CDN: z
      .string()
      .optional()
      .transform((v) => v === "true"),
  },

  /**
   * Because Next.js edge/client bundling only inlines process.env.NEXT_PUBLIC_*
   * references that are written out literally, you must destructure them here
   * by hand — you can't just spread process.env.
   */
  runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    NEXT_PUBLIC_CLOUDINARY_SECURE_DISTRIBUTION:
      process.env.NEXT_PUBLIC_CLOUDINARY_SECURE_DISTRIBUTION,
    NEXT_PUBLIC_CLOUDINARY_PRIVATE_CDN:
      process.env.NEXT_PUBLIC_CLOUDINARY_PRIVATE_CDN,

    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    DATABASE_URL: process.env.DATABASE_URL,

    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    NODE_ENV: process.env.NODE_ENV,
  },

  /**
   * Skip validation with `SKIP_ENV_VALIDATION=1 next build` (e.g. Docker builds).
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined so `FOO=""` in .env fails required checks
   * instead of silently passing.
   */
  emptyStringAsUndefined: true,
});
