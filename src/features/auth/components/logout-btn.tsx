"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
          router.refresh(); // clears any cached Server Component data tied to the old session
        },
      },
    });
    setLoading(false);
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={loading}>
      {loading ? "Logging out..." : "Log out"}
    </Button>
  );
}
