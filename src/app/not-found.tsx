import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-4 px-4">
      <HugeiconsIcon icon={Alert} />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Page Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          We could not find the page you were looking for.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
