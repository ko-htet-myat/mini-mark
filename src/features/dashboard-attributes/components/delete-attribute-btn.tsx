"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAttribute } from "@/features/dashboard-attributes/actions";
import { useShop } from "@/context/shop-context";

interface DeleteAttributeButtonProps {
  attributeId: string;
  attributeName: string;
  redirectOnSuccess?: boolean;
}

export function DeleteAttributeButton({
  attributeId,
  attributeName,
  redirectOnSuccess,
}: DeleteAttributeButtonProps) {
  const tc = useTranslations("Common");
  const ta = useTranslations("Attributes");
  const [open, setOpen] = useState(false);
  const { slug } = useShop();
  const router = useRouter();

  const { execute, isExecuting } = useAction(
    deleteAttribute.bind(null, { shop: slug }),
    {
      onSuccess: () => {
        toast.success(ta("attribute_deleted"));
        setOpen(false);
        if (redirectOnSuccess) {
          router.push(`/${slug}/dashboard/attributes`);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? ta("failed_delete_attribute"));
      },
    },
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <HugeiconsIcon icon={Delete02Icon} size={16} className="mr-1" />
          {tc("delete")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {tc("confirm_delete_title", { name: attributeName })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {ta("delete_attribute_confirm_desc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExecuting}>
            {tc("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // stop the dialog auto-closing before the action resolves
              execute({ id: attributeId });
            }}
            disabled={isExecuting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isExecuting ? tc("deleting") : tc("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
