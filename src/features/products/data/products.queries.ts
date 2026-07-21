import { prisma } from "@/lib/prisma";

type GetShopProductsParams = {
  shopId: string;
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  brandSlug?: string;
  nameFilter?: string;
};

export async function getShopProducts({
  shopId,
  page = 1,
  pageSize = 12,
  categorySlug,
  brandSlug,
  nameFilter,
}: GetShopProductsParams) {
  const where = {
    shopId,
    isActive: true,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(brandSlug ? { brand: { slug: brandSlug } } : {}),
    ...(nameFilter
      ? { name: { contains: nameFilter, mode: "insensitive" as const } }
      : {}),
  };

  const [rawProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        images: true,
        stock: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  // Convert Decimal -> number here, once, so nothing downstream has to deal with Prisma.Decimal
  const products = rawProducts.map((p) => ({
    ...p,
    price: p.price.toNumber(),
    compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toNumber() : null,
  }));

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export type ShopProduct = Awaited<
  ReturnType<typeof getShopProducts>
>["products"][number];
