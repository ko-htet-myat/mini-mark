import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { getSession } from "@/lib/get-session";
import { ShopProvider } from "@/store/shop-context";

export default async function ShopDashboardLayout({
  params,
  children,
}: {
  params: Promise<{ shop: string }>;
  children: React.ReactNode;
}) {
  const { shop: slug } = await params;

  const session = await getSession();
  if (!session) {
    redirect(`/login?redirect=/${slug}/dashboard`);
  }

  const shop = await prisma.shop.findUnique({ where: { slug } });
  if (!shop) notFound();

  if (shop.ownerId !== session.user.id) {
    // logged in, but doesn't own this shop — 404 rather than 403,
    // so you don't leak which slugs exist to non-owners
    notFound();
  }

  return (
    <ShopProvider shop={shop}>
      <div className="min-h-screen">
        <DashboardLayout>{children}</DashboardLayout>
      </div>
    </ShopProvider>
  );
}
