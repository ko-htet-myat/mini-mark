"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
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
import { deleteBrand } from "@/features/brands/actions";
import { useShop } from "@/context/shop-context";

interface DeleteBrandButtonProps {
  brandId: string;
  brandName: string;
}

export function DeleteBrandButton({
  brandId,
  brandName,
}: DeleteBrandButtonProps) {
  const [open, setOpen] = useState(false);
  const { slug } = useShop();

  const { execute, isExecuting } = useAction(
    deleteBrand.bind(null, { shop: slug }),
    {
      onSuccess: () => {
        toast.success("Brand deleted");
        setOpen(false);
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to delete brand.");
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
          <AlertDialogTitle>{`Delete "${brandName}"?`}</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the brand
            and remove it from your catalog.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExecuting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // stop the dialog auto-closing before the action resolves
              execute({ id: brandId });
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
