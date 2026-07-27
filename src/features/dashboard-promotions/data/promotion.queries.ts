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
