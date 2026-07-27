"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Edit03Icon,
  MoreHorizontalIcon,
  Copy01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteAction } from "@/hooks/use-delete-action";
import {
  deleteProduct,
  duplicateProduct,
} from "@/features/dashboard-products/actions";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { useShop } from "@/context/shop-context";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface ProductRowActionsProps {
  productId: string;
  productName: string;
}

export function ProductRowActions({
  productId,
  productName,
}: ProductRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { slug } = useShop();
  const tc = useTranslations("Common");

  const {
    confirmOpen,
    setConfirmOpen,
    isExecuting,
    confirmDelete,
    openConfirm,
  } = useDeleteAction({
    action: deleteProduct.bind(null, { shop: slug }),
    successMessage: "Product deleted",
    errorMessage: "Failed to delete product",
  });

  const { execute: executeDuplicate, isExecuting: isDuplicating } = useAction(
    duplicateProduct.bind(null, { shop: slug }),
    {
      onSuccess: () => {
        toast.success("Product duplicated successfully");
        setMenuOpen(false);
      },
      onError: ({ error }) => {
        const message =
          typeof error.serverError === "string"
            ? error.serverError
            : "Failed to duplicate product";
        toast.error(message);
        setMenuOpen(false);
      },
    },
  );

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
            <Link href={`products/${productId}/edit`}>
              <HugeiconsIcon icon={Edit03Icon} size={16} className="mr-1" />
              {tc("edit")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isDuplicating}
            onSelect={(e) => {
              e.preventDefault();
              executeDuplicate({ id: productId });
            }}
          >
            {isDuplicating ? (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={16}
                className="mr-1 animate-spin"
              />
            ) : (
              <HugeiconsIcon icon={Copy01Icon} size={16} className="mr-1" />
            )}
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              setMenuOpen(false);
              openConfirm();
            }}
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} className="mr-1" />
            {tc("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={tc("confirm_delete_title", { name: productName })}
        description="This will permanently delete the product."
        onConfirm={() => confirmDelete(productId)}
        isPending={isExecuting}
      />
    </>
  );
}
