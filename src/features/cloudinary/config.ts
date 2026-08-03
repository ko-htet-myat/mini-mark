import { env } from "@/env";
import { v2 as cloudinary } from "cloudinary";

// Server-only Cloudinary client. Never import this file from a "use client"
// component — it holds the API secret.
cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
