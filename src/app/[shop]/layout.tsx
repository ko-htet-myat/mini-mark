import { getShopBySlug } from "@/features/shop/data/get-shop";

export default async function ShopLayout({
  params,
  children,
}: {
  params: Promise<{ shop: string }>;
  children: React.ReactNode;
}) {
  const { shop: slug } = await params;
  await getShopBySlug(slug);
  return <>{children}</>;
}
