import { CategoryDataTable } from "@/features/categories/components/category-data-table";
import {
  getCategoriesPage,
  getCategoryBreadcrumb,
} from "@/features/categories/data/categories.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { parsePagination } from "@/lib/parse-pagination";

interface CategoriesPageProps {
  params: Promise<{ shop: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    name?: string;
    /** The category whose children we're browsing; absent = root (L1) */
    parentId?: string;
  }>;
}

export default async function CategoriesPage({
  params,
  searchParams,
}: CategoriesPageProps) {
  const { shop: slug } = await params;
  const sp = await searchParams;
  const shop = await getShopBySlug(slug);

  const { page, pageSize } = parsePagination(sp);
  const nameFilter = sp.name ?? "";
  const parentId = sp.parentId ?? null;

  // Resolve breadcrumb trail + current level
  let breadcrumb: { id: string; name: string }[] = [];
  let level = 1;

  if (parentId) {
    breadcrumb = await getCategoryBreadcrumb(parentId);
    level = breadcrumb.length + 1; // children of a path of N items are at level N+1
    if (level > 3) level = 3; // cap at 3
  }

  const { data, total, pageCount } = await getCategoriesPage({
    shopId: shop.id,
    page,
    pageSize,
    nameFilter,
    parentId,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <CategoryDataTable
        data={data}
        pageCount={pageCount}
        total={total}
        page={page}
        pageSize={pageSize}
        nameFilter={nameFilter}
        parentId={parentId}
        breadcrumb={breadcrumb}
        level={level}
      />
    </div>
  );
}
