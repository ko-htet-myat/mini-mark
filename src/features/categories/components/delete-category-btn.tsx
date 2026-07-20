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
import { deleteCategory } from "@/features/categories/actions";
import { useShop } from "@/context/shop-context";

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

  const { execute, isExecuting } = useAction(
    deleteCategory.bind(null, { shop: slug }),
    {
      onSuccess: () => {
        toast.success("Category deleted");
        setOpen(false);
        if (redirectOnSuccess) {
          router.push(
            `/${slug}/dashboard/categories${parentId ? `?parentId=${parentId}` : ""}`,
          );
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to delete category.");
      },
    },
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <HugeiconsIcon icon={Delete02Icon} size={16} className="mr-1" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{`Delete "${categoryName}"?`}</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            category and all its subcategories.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExecuting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              execute({ id: categoryId });
            }}
            disabled={isExecuting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isExecuting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
