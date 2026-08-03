import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { getUserByEmail } from "@/features/shop/data/get-user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const user = await getUserByEmail(session.user.email);

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20">
            ADMIN
          </span>
          <h1 className="text-sm font-semibold text-foreground">
            Mini Market Myanmar — Admin
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
