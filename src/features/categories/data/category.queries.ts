import { prisma } from "@/lib/prisma";

export async function getShopCategories(shopId: string) {
  return prisma.category.findMany({
    where: { shopId, parentId: null }, // top-level categories only for the storefront nav
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}
