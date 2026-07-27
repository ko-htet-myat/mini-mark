import prisma from "@/lib/prisma";

export async function getNewArrivalProducts(shopId: string, limit = 8) {
  return prisma.product.findMany({
    where: { shopId, isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
