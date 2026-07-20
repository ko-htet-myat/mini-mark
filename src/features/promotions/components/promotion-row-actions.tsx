"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Edit03Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteAction } from "@/hooks/use-delete-action";
import { deletePromotion } from "@/features/promotions/actions";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { useShop } from "@/context/shop-context";

interface PromotionRowActionsProps {
  promotionId: string;
  promotionName: string;
}

export function PromotionRowActions({
  promotionId,
  promotionName,
}: PromotionRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { slug } = useShop();

  const {
    confirmOpen,
    setConfirmOpen,
    isExecuting,
    confirmDelete,
    openConfirm,
  } = useDeleteAction({
    action: deletePromotion.bind(null, { shop: slug }),
    successMessage: "Promotion deleted",
    errorMessage: "Failed to delete promotion.",
  });

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <HugeiconsIcon icon={MoreHorizontalIcon} size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`promotions/${promotionId}/edit`}>
              <HugeiconsIcon icon={Edit03Icon} size={16} className="mr-1" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              setMenuOpen(false);
              openConfirm();
            }}
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} className="mr-1" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${promotionName}"?`}
        description="This will permanently delete the promotion and remove it from your catalog."
        onConfirm={() => confirmDelete(promotionId)}
        isPending={isExecuting}
      />
    </>
  );
}
