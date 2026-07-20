import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UpdateBrandForm } from "@/features/brands/components/edit-brand-form";
import { DeleteBrandButton } from "@/features/brands/components/delete-brand-btn";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ shop: string; brandId: string }>;
}) {
  const { brandId } = await params;
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
  });
  if (!brand) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit brand</h1>
        <DeleteBrandButton
          brandId={brand.id}
          brandName={brand.name}
          redirectOnSuccess={true}
        />
      </div>
      <UpdateBrandForm
        brand={{
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          description: brand.description ?? "",
          logoUrl: brand.logoUrl ?? "",
        }}
      />
    </div>
  );
}
