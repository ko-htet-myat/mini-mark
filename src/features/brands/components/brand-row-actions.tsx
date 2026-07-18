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
import { deleteBrand } from "@/features/brands/actions";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";

interface BrandRowActionsProps {
  brandId: string;
  brandName: string;
}

export function BrandRowActions({ brandId, brandName }: BrandRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    confirmOpen,
    setConfirmOpen,
    isExecuting,
    confirmDelete,
    openConfirm,
  } = useDeleteAction({
    action: deleteBrand,
    successMessage: "Brand deleted",
    errorMessage: "Failed to delete brand.",
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
            <Link href={`brands/${brandId}/edit`}>
              {" "}
              <HugeiconsIcon
                icon={Edit03Icon}
                size={16}
                className="mr-1"
              />{" "}
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
        title={`Delete "${brandName}"?`}
        description="This will permanently delete the brand and remove it from your catalog."
        onConfirm={() => confirmDelete(brandId)}
        isPending={isExecuting}
      />
    </>
  );
}
