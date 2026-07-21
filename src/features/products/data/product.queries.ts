import { prisma } from "@/lib/prisma";

interface GetProductsParams {
  shopId: string;
  page: number; // 0-indexed
  pageSize: number;
  nameFilter?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
}

export async function getProductsPage({
  shopId,
  page,
  pageSize,
  nameFilter,
  categoryId,
  brandId,
  isActive,
}: GetProductsParams) {
  const where = {
    shopId,
    ...(nameFilter
      ? { name: { contains: nameFilter, mode: "insensitive" as const } }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        attributeValues: {
          include: {
            attributeValue: {
              include: {
                attribute: { select: { id: true, name: true } },
              },
            },
          },
        },
        promotions: {
          select: {
            id: true,
            name: true,
            discountType: true,
            discountValue: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const formattedData = data.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    sku: product.sku,
    stock: product.stock,
    images: product.images,
    youtubeUrl: product.youtubeUrl,
    isActive: product.isActive,
    shopId: product.shopId,
    categoryId: product.categoryId,
    brandId: product.brandId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: product.category,
    brand: product.brand,
    attributeValues: product.attributeValues.map((av) => ({
      ...av,
      extraPrice: av.extraPrice ? Number(av.extraPrice) : null,
    })),
    promotions: product.promotions.map((p) => ({
      id: p.id,
      name: p.name,
      discountType: p.discountType,
      discountValue: Number(p.discountValue),
    })),
  }));

  return { data: formattedData, total, pageCount: Math.ceil(total / pageSize) };
}

export async function getProductById(id: string, shopId: string) {
  const product = await prisma.product.findFirst({
    where: { id, shopId },
    include: {
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      attributeValues: {
        include: {
          attributeValue: {
            include: {
              attribute: { select: { id: true, name: true } },
            },
          },
        },
      },
      promotions: { select: { id: true, name: true } },
    },
  });

  if (!product) return null;

  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    attributeValues: product.attributeValues.map((av) => ({
      ...av,
      extraPrice: av.extraPrice ? Number(av.extraPrice) : null,
    })),
  };
}

export async function getShopProductFormData(shopId: string) {
  const [categories, brands, attributes, promotions] = await Promise.all([
    prisma.category.findMany({
      where: { shopId },
      select: {
        id: true,
        name: true,
        parentId: true,
        parent: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      where: { shopId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.attribute.findMany({
      where: { shopId },
      include: {
        values: {
          select: { id: true, value: true },
          orderBy: { value: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.promotion.findMany({
      where: { shopId, isActive: true },
      select: { id: true, name: true, discountType: true, discountValue: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const formattedPromotions = promotions.map((p) => ({
    id: p.id,
    name: p.name,
    discountType: p.discountType,
    discountValue: Number(p.discountValue),
  }));

  return { categories, brands, attributes, promotions: formattedPromotions };
}
