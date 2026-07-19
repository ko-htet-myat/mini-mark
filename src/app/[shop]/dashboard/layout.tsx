import DashboardLayout from "@/components/layout/dashboard-layout";
import { ShopProvider } from "@/context/shop-context";
import { getShopBySlug } from "@/features/shop/data/get-shop";
import { getSession } from "@/lib/get-session";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shop: string }>;
}) {
  const { shop } = await params;
  const shopData = await getShopBySlug(shop);
  return { title: `${shopData.name} — Dashboard` };
}

export default async function ShopDashboardLayout({
  params,
  children,
}: {
  params: Promise<{ shop: string }>;
  children: React.ReactNode;
}) {
  const { shop: slug } = await params;

  const [session, shop] = await Promise.all([
    getSession(),
    getShopBySlug(slug),
  ]);
  if (!session) {
    redirect(`/sign-in?redirect=/${slug}/dashboard`);
  }

  if (shop.ownerId !== session.user.id) {
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
