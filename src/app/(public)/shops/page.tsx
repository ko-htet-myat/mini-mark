import { getTranslations } from "next-intl/server";
import { ShopGrid } from "@/features/shop/components/shops-grid";
import { getShopsPage } from "@/features/shop/data/shop.queries";
import { parsePagination } from "@/lib/parse-pagination";

interface ShopsPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string; name?: string }>;
}

export default async function ShopsPage({ searchParams }: ShopsPageProps) {
  const t = await getTranslations("Shops");
  const sp = await searchParams;
  const { page, pageSize } = parsePagination(sp);
  const nameFilter = sp.name ?? "";

  const { data, total, pageCount } = await getShopsPage({
    page,
    pageSize,
    nameFilter,
  });

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{t("discover_shops")}</h1>
        <p className="text-muted-foreground">{t("shops_subtitle")}</p>
      </div>
      <ShopGrid
        data={data}
        total={total}
        pageCount={pageCount}
        page={page}
        nameFilter={nameFilter}
      />
    </div>
  );
}
