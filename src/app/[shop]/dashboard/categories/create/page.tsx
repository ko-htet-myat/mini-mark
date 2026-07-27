import { CreateCategoryForm } from "@/features/dashboard-categories/components/forms/create-category-form";
import { getAllPotentialParents } from "@/features/dashboard-categories/data/categories.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";

export default async function CreateCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ shop: string }>;
  searchParams: Promise<{ parentId?: string }>;
}) {
  const { shop: slug } = await params;
  const sp = await searchParams;
  const shop = await getShopBySlug(slug);

  const parentId = sp.parentId ?? null;

  // Load all potential parents (L1 and L2)
  const parentOptions = await getAllPotentialParents(shop.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create Category</h1>
      <CreateCategoryForm
        shopId={shop.id}
        defaultParentId={parentId ?? ""}
        parentOptions={parentOptions}
      />
    </div>
  );
}
