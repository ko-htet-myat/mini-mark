import { prisma } from "@/lib/prisma";
import type {
  ProductDetailData,
  ProductAttributeGroup,
  ProductVariantItem,
  ProductAddonGroup,
} from "../types";

interface GetProductDetailParams {
  shopSlug: string;
  productId: string;
}

export async function getProductDetail({
  shopSlug,
  productId,
}: GetProductDetailParams): Promise<ProductDetailData | null> {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
      shop: { slug: shopSlug },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      youtubeUrl: true,
      price: true,
      compareAtPrice: true,
      imageUrl: true,
      isActive: true,
      hasVariants: true,
      createdAt: true,
      categoryId: true,
      brandId: true,
      specifications: true,
      addons: true,
      brand: true,
      category: { include: { parent: true } },
      variants: {
        where: { isActive: true },
        include: {
          attributeValues: {
            include: {
              attributeValue: { include: { attribute: true } },
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  const now = new Date();
  const activePromotions = await prisma.promotion.findMany({
    where: {
      shop: { slug: shopSlug },
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        {
          OR: [
            { products: { some: { id: productId } } },
            ...(product.categoryId
              ? [{ categories: { some: { id: product.categoryId } } }]
              : []),
            ...(product.brandId
              ? [{ brands: { some: { id: product.brandId } } }]
              : []),
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      discountType: true,
      discountValue: true,
      slug: true,
    },
  });

  const activeVariants = product.variants;

  const images = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...activeVariants
      .map((v) => v.imageUrl)
      .filter((url): url is string => Boolean(url)),
  ];

  const stock = activeVariants.reduce((sum, v) => sum + v.stock, 0);

  const groupsByAttributeId = new Map<string, ProductAttributeGroup>();
  for (const variant of activeVariants) {
    for (const pvav of variant.attributeValues) {
      const attribute = pvav.attributeValue.attribute;
      const existing = groupsByAttributeId.get(attribute.id);
      const value = {
        id: pvav.attributeValue.id,
        value: pvav.attributeValue.value,
      };

      if (existing) {
        if (!existing.values.some((v) => v.id === value.id)) {
          existing.values.push(value);
        }
      } else {
        groupsByAttributeId.set(attribute.id, {
          id: attribute.id,
          name: attribute.name,
          slug: attribute.slug,
          values: [value],
        });
      }
    }
  }

  const variants: ProductVariantItem[] = activeVariants.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: v.price ? Number(v.price) : null,
    compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
    stock: v.stock,
    status: v.status,
    imageUrl: v.imageUrl,
    attributeValueIds: v.attributeValues.map((av) => av.attributeValue.id),
  }));

  // Safely cast JSON fields to typed shapes
  const specifications =
    product.specifications &&
    typeof product.specifications === "object" &&
    !Array.isArray(product.specifications)
      ? (product.specifications as Record<string, string>)
      : null;

  const addons = Array.isArray(product.addons)
    ? (product.addons as unknown as ProductAddonGroup[])
    : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    youtubeUrl: product.youtubeUrl,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    imageUrl: product.imageUrl,
    images,
    isActive: product.isActive,
    hasVariants: product.hasVariants,
    stock,
    createdAt: product.createdAt.toISOString(),
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
          description: product.brand.description,
          logoUrl: product.brand.logoUrl,
        }
      : null,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
          parent: product.category.parent
            ? {
                id: product.category.parent.id,
                name: product.category.parent.name,
                slug: product.category.parent.slug,
              }
            : null,
        }
      : null,
    attributeGroups: Array.from(groupsByAttributeId.values()),
    variants,
    promotions: activePromotions.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      discountType: p.discountType,
      discountValue: Number(p.discountValue),
      slug: p.slug,
    })),
    specifications,
    addons,
  };
}
