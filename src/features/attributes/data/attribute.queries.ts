import { prisma } from "@/lib/prisma";

interface GetAttributesParams {
  shopId: string;
  page: number; // 0-indexed
  pageSize: number;
  nameFilter?: string;
}

export async function getAttributesPage({
  shopId,
  page,
  pageSize,
  nameFilter,
}: GetAttributesParams) {
  const where = {
    shopId,
    ...(nameFilter
      ? { name: { contains: nameFilter, mode: "insensitive" as const } }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.attribute.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
      include: {
        values: true,
      },
    }),
    prisma.attribute.count({ where }),
  ]);

  return { data, total, pageCount: Math.ceil(total / pageSize) };
}

export async function getAttributeById(id: string) {
  return prisma.attribute.findUnique({
    where: { id },
    include: { values: true },
  });
}
