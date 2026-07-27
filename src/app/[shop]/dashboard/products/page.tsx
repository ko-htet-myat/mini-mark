import { ProductDataTable } from "@/features/dashboard-products/components/tables/product-data-table";
import { getProductsPage } from "@/features/dashboard-products/data/product.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { parsePagination } from "@/lib/parse-pagination";

interface DashboardProductsPageProps {
  params: Promise<{ shop: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    name?: string;
    categoryId?: string;
    brandId?: string;
  }>;
}

export default async function DashboardProductsPage({
  params,
  searchParams,
}: DashboardProductsPageProps) {
  const { shop: slug } = await params;
  const sp = await searchParams;
  const shop = await getShopBySlug(slug);

  const { page, pageSize } = parsePagination(sp);
  const nameFilter = sp.name ?? "";
  const categoryId = sp.categoryId ?? undefined;
  const brandId = sp.brandId ?? undefined;

  const { data, total, pageCount } = await getProductsPage({
    shopId: shop.id,
    page,
    pageSize,
    nameFilter,
    categoryId,
    brandId,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      <ProductDataTable
        data={data}
        pageCount={pageCount}
        total={total}
        page={page}
        nameFilter={nameFilter}
      />
    </div>
  );
}
