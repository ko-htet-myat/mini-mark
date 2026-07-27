"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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
import { deleteBrand } from "@/features/dashboard-brands/actions";
import { useShop } from "@/context/shop-context";

interface DeleteBrandButtonProps {
  brandId: string;
  brandName: string;
  redirectOnSuccess?: boolean;
}

export function DeleteBrandButton({
  brandId,
  brandName,
  redirectOnSuccess,
}: DeleteBrandButtonProps) {
  const [open, setOpen] = useState(false);
  const { slug } = useShop();
  const router = useRouter();
  const tc = useTranslations("Common");
  const tb = useTranslations("Brands");

  const { execute, isExecuting } = useAction(
    deleteBrand.bind(null, { shop: slug }),
    {
      onSuccess: () => {
        toast.success(tb("brand_deleted"));
        setOpen(false);
        if (redirectOnSuccess) {
          router.push(`/${slug}/dashboard/brands`);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? tb("failed_delete_brand"));
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
            {tc("confirm_delete_title", { name: brandName })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {tb("delete_brand_confirm_desc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExecuting}>
            {tc("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // stop the dialog auto-closing before the action resolves
              execute({ id: brandId });
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
