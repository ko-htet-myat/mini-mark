import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { getSession } from "@/lib/get-session";
import { env } from "@/env";

// ⚠️ Reference only — you already have this route per FEATURES.md. Merge
// this in only if yours doesn't yet: (a) require a session, or (b) accept a
// `folder` in the request body to sign per-feature upload folders.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const folder: string | undefined = body?.folder;

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = { timestamp };
  if (folder) paramsToSign.folder = folder;

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET,
  );

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    folder,
  });
}
