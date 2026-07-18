import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const getShopBySlug = cache(async (slug: string) => {
  const shop = await prisma.shop.findUnique({ where: { slug } });
  if (!shop) notFound();
  return shop;
});
