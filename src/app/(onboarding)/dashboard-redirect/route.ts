import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const shop = await prisma.shop.findUnique({
    where: { ownerId: session.user.id },
    select: { slug: true },
  });

  if (!shop) {
    // no shop yet -> send to onboarding
    return NextResponse.redirect(new URL("/create-shop", request.url));
  }

  return NextResponse.redirect(new URL(`/${shop.slug}/dashboard`, request.url));
}
