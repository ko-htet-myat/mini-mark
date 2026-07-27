import { prisma } from "@/lib/prisma";

export async function getShopBrands(shopId: string) {
  return prisma.brand.findMany({
    where: { shopId },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}
