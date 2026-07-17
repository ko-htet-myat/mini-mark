import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/get-session";

export default async function SocialCheckAuthPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const shop = await prisma.shop.findUnique({
    where: { ownerId: session.user.id },
    select: { slug: true },
  });

  if (shop) {
    redirect(`/${shop.slug}/dashboard`);
  }

  redirect("/onboarding/create-shop");
}
