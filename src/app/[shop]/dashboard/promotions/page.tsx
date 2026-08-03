import { getTranslations } from "next-intl/server";
import { PromotionDataTable } from "@/features/dashboard-promotions/components/tables/promotion-data-table";
import { getPromotionsPage } from "@/features/dashboard-promotions/data/promotion.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { parsePagination } from "@/lib/parse-pagination";

interface PromotionsPageProps {
  params: Promise<{ shop: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string; name?: string }>;
}

export default async function PromotionsPage({
  params,
  searchParams,
}: PromotionsPageProps) {
  const t = await getTranslations("sidebar");
  const { shop: slug } = await params;
  const searchParamKeys = await searchParams;
  const shop = await getShopBySlug(slug);

  const { page, pageSize } = parsePagination(searchParamKeys);
  const nameFilter = searchParamKeys.name ?? "";

  const { data, total, pageCount } = await getPromotionsPage({
    shopId: shop.id,
    page,
    pageSize,
    nameFilter,
  });

  // Serialize Prisma Decimal to number to avoid Next.js Server Component serialization error
  const serializedData = data.map((p) => ({
    ...p,
    discountValue: p.discountValue.toNumber(),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("promotions")}</h1>
      <PromotionDataTable
        data={serializedData}
        pageCount={pageCount}
        total={total}
        page={page}
        pageSize={pageSize}
        nameFilter={nameFilter}
      />
    </div>
  );
}
