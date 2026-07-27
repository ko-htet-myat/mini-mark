import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UpdateCategoryForm } from "@/features/dashboard-categories/components/forms/edit-category-form";
import { DeleteCategoryButton } from "@/features/dashboard-categories/components/delete-category-btn";
import { getAllPotentialParents } from "@/features/dashboard-categories/data/categories.queries";
import { getShopBySlug } from "@/features/shop/data/get-shop";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ shop: string; categoryId: string }>;
}) {
  const { shop: slug, categoryId } = await params;
  const shop = await getShopBySlug(slug);

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) notFound();

  // Load parent options for the form, filtering out itself and its children
  const allPotentialParents = await getAllPotentialParents(shop.id);
  const parentOptions = allPotentialParents.filter(
    (opt) => opt.id !== category.id && opt.parentId !== category.id,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Category</h1>
        <DeleteCategoryButton
          categoryId={category.id}
          categoryName={category.name}
          parentId={category.parentId}
          redirectOnSuccess={true}
        />
      </div>
      <UpdateCategoryForm
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          parentId: category.parentId ?? "",
        }}
        parentOptions={parentOptions}
      />
    </div>
  );
}
