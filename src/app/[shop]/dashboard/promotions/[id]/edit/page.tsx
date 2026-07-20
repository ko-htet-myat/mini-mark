import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditPromotionForm } from "@/features/promotions/components/edit-promotion-form";
import { DeletePromotionButton } from "@/features/promotions/components/delete-promotion-btn";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ shop: string; id: string }>;
}) {
  const { id } = await params;
  const promotion = await prisma.promotion.findUnique({
    where: { id },
  });
  if (!promotion) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit promotion</h1>
        <DeletePromotionButton
          promotionId={promotion.id}
          promotionName={promotion.name}
          redirectOnSuccess={true}
        />
      </div>
      <EditPromotionForm
        promotion={{
          id: promotion.id,
          name: promotion.name,
          slug: promotion.slug,
          description: promotion.description ?? "",
          discountType: promotion.discountType,
          discountValue: promotion.discountValue.toNumber(), // Serialize Decimal
          code: promotion.code ?? "",
          isActive: promotion.isActive,
        }}
      />
    </div>
  );
}
