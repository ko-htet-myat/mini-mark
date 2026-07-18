import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteAction({
  action,
  successMessage = "Deleted successfully",
  errorMessage = "Failed to delete",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any; // next-safe-action's generic action types are awkward to reference indirectly; runtime validation in the action itself is the real safety net
  successMessage?: string;
  errorMessage?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute, isExecuting } = useAction(action, {
    onSuccess: () => {
      toast.success(successMessage);
      setConfirmOpen(false);
    },
    onError: ({ error }) => {
      const message =
        typeof error.serverError === "string"
          ? error.serverError
          : errorMessage;
      toast.error(message);
    },
  });

  return {
    confirmOpen,
    setConfirmOpen,
    isExecuting,
    confirmDelete: (id: string) => execute({ id }),
    openConfirm: () => setConfirmOpen(true),
  };
}
