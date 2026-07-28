import { prisma } from "@/lib/prisma";
import type { ProductDetailData, ProductAttributeGroup } from "../types";

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
    include: {
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

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    imageUrl: product.imageUrl,
    images,
    isActive: product.isActive,
    hasVariants: product.hasVariants,
    stock,
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
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
  };
}
