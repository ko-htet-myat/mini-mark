import { prisma } from "@/lib/prisma";

interface GetBrandsParams {
  shopId: string;
  page: number; // 0-indexed
  pageSize: number;
  nameFilter?: string;
}

export async function getBrandsPage({
  shopId,
  page,
  pageSize,
  nameFilter,
}: GetBrandsParams) {
  const where = {
    shopId,
    ...(nameFilter
      ? { name: { contains: nameFilter, mode: "insensitive" as const } }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.brand.count({ where }),
  ]);

  return { data, total, pageCount: Math.ceil(total / pageSize) };
}

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
