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
import { deleteCategory } from "@/features/categories/actions";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { useShop } from "@/context/shop-context";

interface CategoryRowActionsProps {
  categoryId: string;
  categoryName: string;
  /** Current depth level: 1, 2, or 3 */
  level: number;
}

export function CategoryRowActions({
  categoryId,
  categoryName,
  level,
}: CategoryRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { slug } = useShop();

  const {
    confirmOpen,
    setConfirmOpen,
    isExecuting,
    confirmDelete,
    openConfirm,
  } = useDeleteAction({
    action: deleteCategory.bind(null, { shop: slug }),
    successMessage: "Category deleted",
    errorMessage: "Failed to delete category.",
  });

  const levelLabel =
    level === 1 ? "" : level === 2 ? " subcategory" : " sub-subcategory";

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
            <Link href={`categories/${categoryId}/edit`}>
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
        title={`Delete "${categoryName}"?`}
        description={`This will permanently delete the${levelLabel} and all its subcategories.`}
        onConfirm={() => confirmDelete(categoryId)}
        isPending={isExecuting}
      />
    </>
  );
}
