import { ProductDataTable } from "@/features/dashboard-products/components/tables/product-data-table";
import {
  getProductsPage,
  getShopProductFormData,
} from "@/features/dashboard-products/data/product.queries";
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
    status?: string;
    from?: string;
    to?: string;
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
  const statusFilter = sp.status ?? undefined;

  const from = sp.from ? new Date(sp.from) : undefined;
  const to = sp.to ? new Date(sp.to) : undefined;
  // If `to` is provided without time, make it end of the day
  if (to) {
    to.setHours(23, 59, 59, 999);
  }

  const { data, total, pageCount } = await getProductsPage({
    shopId: shop.id,
    page,
    pageSize,
    nameFilter,
    categoryId,
    brandId,
    isActive:
      statusFilter === "active"
        ? true
        : statusFilter === "draft"
          ? false
          : undefined,
    from,
    to,
  });

  const formData = await getShopProductFormData(shop.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      <ProductDataTable
        data={data}
        pageCount={pageCount}
        total={total}
        page={page}
        pageSize={pageSize}
        nameFilter={nameFilter}
        categories={formData.categories}
        statusFilter={statusFilter}
        categoryIdFilter={categoryId}
        brandIdFilter={brandId}
        fromFilter={sp.from}
        toFilter={sp.to}
      />
    </div>
  );
}
