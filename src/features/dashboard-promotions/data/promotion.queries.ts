import { prisma } from "@/lib/prisma";

interface GetPromotionsParams {
  shopId: string;
  page: number; // 0-indexed
  pageSize: number;
  nameFilter?: string;
}

export async function getPromotionsPage({
  shopId,
  page,
  pageSize,
  nameFilter,
}: GetPromotionsParams) {
  const where = {
    shopId,
    ...(nameFilter
      ? { name: { contains: nameFilter, mode: "insensitive" as const } }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.promotion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.promotion.count({ where }),
  ]);

  return { data, total, pageCount: Math.ceil(total / pageSize) };
}

export async function getPromotionById(id: string, shopId: string) {
  return prisma.promotion.findFirst({
    where: { id, shopId },
    include: {
      products: {
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function getPromotionProductOptions(shopId: string) {
  return prisma.product.findMany({
    where: { shopId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  });
}
