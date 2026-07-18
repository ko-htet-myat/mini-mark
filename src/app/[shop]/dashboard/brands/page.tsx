import { BrandDataTable } from "@/features/brands/components/brand-data-table";
import { getBrandsPage } from "@/features/brands/data/brand.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";

interface BrandsPageProps {
  params: Promise<{ shop: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string; name?: string }>;
}

export default async function BrandsPage({
  params,
  searchParams,
}: BrandsPageProps) {
  const { shop: slug } = await params;
  const searchParamKeys = await searchParams;
  const shop = await getShopBySlug(slug);

  const page = Number(searchParamKeys.page ?? 0);
  const pageSize = Number(searchParamKeys.pageSize ?? 10);
  const nameFilter = searchParamKeys.name ?? "";

  const { data, total, pageCount } = await getBrandsPage({
    shopId: shop.id,
    page,
    pageSize,
    nameFilter,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Brands</h1>
      <BrandDataTable
        data={data}
        pageCount={pageCount}
        total={total}
        page={page}
        pageSize={pageSize}
        nameFilter={nameFilter}
      />
    </div>
  );
}
