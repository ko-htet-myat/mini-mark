import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ShopLayout({
  params,
  children,
}: {
  params: Promise<{ shop: string }>;
  children: React.ReactNode;
}) {
  const { shop: slug } = await params;
  const shop = await prisma.shop.findUnique({ where: { slug } });

  if (!shop) notFound();

  return <>{children}</>;
}
