import { SettingsForm } from "@/features/settings/components/settings-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function SettingPage({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop: slug } = await params;
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { operatingHours: true },
  });

  if (!shop) notFound();

  return (
    <div>
      <SettingsForm shop={shop} />
    </div>
  );
}
