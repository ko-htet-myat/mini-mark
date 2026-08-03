import { getTranslations } from "next-intl/server";
import { BrandDataTable } from "@/features/dashboard-brands/components/tables/brand-data-table";
import { getBrandsPage } from "@/features/dashboard-brands/data/brand.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { parsePagination } from "@/lib/parse-pagination";

interface BrandsPageProps {
  params: Promise<{ shop: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string; name?: string }>;
}

export default async function BrandsPage({
  params,
  searchParams,
}: BrandsPageProps) {
  const t = await getTranslations("sidebar");
  const { shop: slug } = await params;
  const searchParamKeys = await searchParams;
  const shop = await getShopBySlug(slug);

  const { page, pageSize } = parsePagination(searchParamKeys);
  const nameFilter = searchParamKeys.name ?? "";

  const { data, total, pageCount } = await getBrandsPage({
    shopId: shop.id,
    page,
    pageSize,
    nameFilter,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("brands")}</h1>
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
