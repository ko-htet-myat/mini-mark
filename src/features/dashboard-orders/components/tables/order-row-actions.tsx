"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon, ViewIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

interface OrderRowActionsProps {
  orderId: string;
}

export function OrderRowActions({ orderId }: OrderRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tcRaw = useTranslations("Common");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tc = tcRaw as any;

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <HugeiconsIcon icon={MoreHorizontalIcon} size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`orders/${orderId}`}>
            <HugeiconsIcon icon={ViewIcon} size={16} className="mr-1" />
            {tc("view_details", { fallback: "View Details" })}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
