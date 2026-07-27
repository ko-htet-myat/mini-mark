import { notFound } from "next/navigation";
import { getAttributeById } from "@/features/dashboard-attributes/data/attribute.queries";
import { EditAttributeForm } from "@/features/dashboard-attributes/components/forms/edit-attribute-form";
import { DeleteAttributeButton } from "@/features/dashboard-attributes/components/delete-attribute-btn";

export default async function EditAttributePage({
  params,
}: {
  params: Promise<{ shop: string; attributeId: string }>;
}) {
  const { attributeId } = await params;
  const attribute = await getAttributeById(attributeId);

  if (!attribute) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit attribute</h1>
        <DeleteAttributeButton
          attributeId={attribute.id}
          attributeName={attribute.name}
          redirectOnSuccess={true}
        />
      </div>
      <EditAttributeForm
        attribute={{
          id: attribute.id,
          name: attribute.name,
          slug: attribute.slug,
          values: attribute.values,
        }}
      />
    </div>
  );
}
