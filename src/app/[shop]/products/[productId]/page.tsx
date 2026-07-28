import { getProductDetail } from "@/features/storefront-products/data/product-detail.query";
import { ProductDetail } from "@/features/storefront-products/components/product-detail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ shop: string; productId: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { shop, productId } = await params;

  const product = await getProductDetail({ shopSlug: shop, productId });

  if (!product) {
    notFound();
  }

  return <ProductDetail shopSlug={shop} product={product} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { shop, productId } = await params;
  const product = await getProductDetail({ shopSlug: shop, productId });

  if (!product) return {};

  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      images: product.images.slice(0, 1),
    },
  };
}
