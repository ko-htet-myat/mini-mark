"use client";

import { useTranslations } from "next-intl";
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
import { deleteAttribute } from "@/features/attributes/actions";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import { useShop } from "@/context/shop-context";

interface AttributeRowActionsProps {
  attributeId: string;
  attributeName: string;
}

export function AttributeRowActions({
  attributeId,
  attributeName,
}: AttributeRowActionsProps) {
  const tc = useTranslations("Common");
  const ta = useTranslations("Attributes");
  const [menuOpen, setMenuOpen] = useState(false);
  const { slug } = useShop();

  const {
    confirmOpen,
    setConfirmOpen,
    isExecuting,
    confirmDelete,
    openConfirm,
  } = useDeleteAction({
    action: deleteAttribute.bind(null, { shop: slug }),
    successMessage: ta("attribute_deleted"),
    errorMessage: ta("failed_delete_attribute"),
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
            <Link href={`attributes/${attributeId}/edit`}>
              {" "}
              <HugeiconsIcon
                icon={Edit03Icon}
                size={16}
                className="mr-1"
              />{" "}
              {tc("edit")}
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
            {tc("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={tc("confirm_delete_title", { name: attributeName })}
        description={ta("delete_attribute_confirm_desc")}
        onConfirm={() => confirmDelete(attributeId)}
        isPending={isExecuting}
      />
    </>
  );
}
