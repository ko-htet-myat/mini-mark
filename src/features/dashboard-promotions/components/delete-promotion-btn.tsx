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
import { deletePromotion } from "@/features/dashboard-promotions/actions";
import { useShop } from "@/context/shop-context";
import { useTranslations } from "next-intl";

interface DeletePromotionButtonProps {
  promotionId: string;
  promotionName: string;
  redirectOnSuccess?: boolean;
}

export function DeletePromotionButton({
  promotionId,
  promotionName,
  redirectOnSuccess,
}: DeletePromotionButtonProps) {
  const [open, setOpen] = useState(false);
  const { slug } = useShop();
  const router = useRouter();
  const tc = useTranslations("Common");
  const tp = useTranslations("Promotions");

  const { execute, isExecuting } = useAction(
    deletePromotion.bind(null, { shop: slug }),
    {
      onSuccess: () => {
        toast.success(tp("promotion_deleted"));
        setOpen(false);
        if (redirectOnSuccess) {
          router.push(`/${slug}/dashboard/promotions`);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? tp("failed_delete_promotion"));
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
            {tc("confirm_delete_title", { name: promotionName })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {tp("delete_promotion_confirm_desc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExecuting}>
            {tc("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              execute({ id: promotionId });
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
