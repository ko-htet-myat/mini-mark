import prisma from "@/lib/prisma";

interface GetShopsParams {
  page: number;
  pageSize: number;
  nameFilter?: string;
}

export async function getShopsPage({
  page,
  pageSize,
  nameFilter,
}: GetShopsParams) {
  const where = nameFilter
    ? { name: { contains: nameFilter, mode: "insensitive" as const } }
    : {};

  const [data, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        logoUrl: true,
        bannerUrl: true,
        currency: true,
      },
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.shop.count({ where }),
  ]);

  return { data, total, pageCount: Math.ceil(total / pageSize) };
}
