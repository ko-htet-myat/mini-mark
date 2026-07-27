import { prisma } from "@/lib/prisma";

interface GetBrandsParams {
  shopId: string;
  page: number;
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
