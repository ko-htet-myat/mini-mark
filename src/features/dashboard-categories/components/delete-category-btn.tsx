"use client";

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
import { deleteCategory } from "@/features/dashboard-categories/actions";
import { useShop } from "@/context/shop-context";
import { useTranslations } from "next-intl";

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  parentId?: string | null;
  redirectOnSuccess?: boolean;
}

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  parentId,
  redirectOnSuccess,
}: DeleteCategoryButtonProps) {
  const [open, setOpen] = useState(false);
  const { slug } = useShop();
  const router = useRouter();
  const tc = useTranslations("Common");
  const tcat = useTranslations("Categories");

  const { execute, isExecuting } = useAction(
    deleteCategory.bind(null, { shop: slug }),
    {
      onSuccess: () => {
        toast.success(tcat("category_deleted"));
        setOpen(false);
        if (redirectOnSuccess) {
          router.push(
            `/${slug}/dashboard/categories${parentId ? `?parentId=${parentId}` : ""}`,
          );
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? tcat("failed_delete_category"));
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
            {tc("confirm_delete_title", { name: categoryName })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {tcat("delete_category_confirm_desc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExecuting}>
            {tc("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              execute({ id: categoryId });
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
