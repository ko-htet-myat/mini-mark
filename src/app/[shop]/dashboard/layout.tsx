import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LogoutButton } from "@/features/auth/components/logout-btn";

export default async function DashboardLayout({
  params,
  children,
}: {
  params: Promise<{ shop: string }>;
  children: React.ReactNode;
}) {
  const { shop: slug } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
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
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b p-4">
        <h2 className="font-medium">{shop.name}</h2>
        <LogoutButton />
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
