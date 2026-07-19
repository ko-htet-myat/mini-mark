import { notFound } from "next/navigation";
import { getAttributeById } from "@/features/attributes/data/attribute.queries";
import { EditAttributeForm } from "@/features/attributes/components/edit-attribute-form";

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
      <h1 className="text-2xl font-semibold">Edit attribute</h1>
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
