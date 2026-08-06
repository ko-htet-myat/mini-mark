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
        imageUrl: true,
        hasVariants: true,
        variants: {
          select: {
            stock: true,
            status: true,
            imageUrl: true,
            price: true,
            isActive: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  const products = rawProducts.map((p) => {
    const activeVariants = p.variants.filter((v) => v.isActive);
    const totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);
    const allOutOfStock = p.hasVariants
      ? activeVariants.length > 0 && activeVariants.every((v) => v.stock === 0)
      : false;

    return {
      ...p,
      price: p.price.toNumber(),
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toNumber() : null,
      variants: p.variants.map((v) => ({
        ...v,
        price: v.price ? v.price.toNumber() : null,
      })),
      stock: totalStock,
      status: allOutOfStock ? ("OUT_OF_STOCK" as const) : ("IN_STOCK" as const),
      imageUrl: p.imageUrl,
    };
  });

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
