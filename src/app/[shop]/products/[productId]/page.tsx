export default async function ShopProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return <div>ShopProductDetailPage - {productId}</div>;
}
