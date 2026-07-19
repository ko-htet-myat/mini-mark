import { AttributeDataTable } from "@/features/attributes/components/attribute-data-table";
import { getAttributesPage } from "@/features/attributes/data/attribute.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { parsePagination } from "@/lib/parse-pagination";

interface AttributesPageProps {
  params: Promise<{ shop: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string; name?: string }>;
}

export default async function AttributesPage({
  params,
  searchParams,
}: AttributesPageProps) {
  const { shop: slug } = await params;
  const searchParamKeys = await searchParams;
  const shop = await getShopBySlug(slug);

  const { page, pageSize } = parsePagination(searchParamKeys);
  const nameFilter = searchParamKeys.name ?? "";

  const { data, total, pageCount } = await getAttributesPage({
    shopId: shop.id,
    page,
    pageSize,
    nameFilter,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Attributes</h1>
      <AttributeDataTable
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
