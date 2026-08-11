import { prisma } from "@/lib/prisma";

interface GetProductsParams {
  shopId: string;
  page: number; // 0-indexed
  pageSize: number;
  nameFilter?: string;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  from?: Date;
  to?: Date;
}

export async function getProductsPage({
  shopId,
  page,
  pageSize,
  nameFilter,
  categoryId,
  brandId,
  isActive,
  from,
  to,
}: GetProductsParams) {
  const where = {
    shopId,
    ...(nameFilter
      ? { name: { contains: nameFilter, mode: "insensitive" as const } }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
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
        variants: {
          include: {
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: { select: { id: true, name: true } },
                  },
                },
              },
            },
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
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    imageUrl: product.imageUrl,
    youtubeUrl: product.youtubeUrl,
    noticeText: product.noticeText,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    hasVariants: product.hasVariants,
    shopId: product.shopId,
    categoryId: product.categoryId,
    brandId: product.brandId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: product.category,
    brand: product.brand,
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price ? Number(v.price) : null,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      stock: v.stock,
      status: v.status,
      imageUrl: v.imageUrl,
      isActive: v.isActive,
      attributeValues: v.attributeValues.map((av) => ({
        attributeValue: {
          attribute: av.attributeValue.attribute,
          value: av.attributeValue.value,
        },
      })),
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
      variants: {
        include: {
          attributeValues: {
            include: {
              attributeValue: {
                include: {
                  attribute: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    // specifications and addons come through as-is (Json | null → unknown)
    specifications: product.specifications as Record<string, string> | null,
    addons: product.addons as
      | {
          groupName: string;
          minSelect: number;
          maxSelect: number;
          options: { name: string; price: number }[];
        }[]
      | null,
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price ? Number(v.price) : null,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      stock: v.stock,
      status: v.status,
      imageUrl: v.imageUrl,
      isActive: v.isActive,
      attributeValues: v.attributeValues.map((av) => ({
        attributeValueId: av.attributeValueId,
        attributeValue: {
          id: av.attributeValue.id,
          value: av.attributeValue.value,
          attribute: av.attributeValue.attribute,
        },
      })),
    })),
  };
}

/** Form data for product create/edit — categories, brands, attributes only (no promotions). */
export async function getShopProductFormData(shopId: string) {
  const [categories, brands, attributes] = await Promise.all([
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
  ]);

  return { categories, brands, attributes };
}
