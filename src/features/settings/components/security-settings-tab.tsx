"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  RefreshIcon,
  UserSwitchIcon,
} from "@hugeicons/core-free-icons";
import { authClient, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

type DeviceSession = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  session?: {
    token?: string;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
    expiresAt?: Date | string | null;
  } | null;
};

function getSessionToken(deviceSession: DeviceSession) {
  return deviceSession.session?.token ?? "";
}

function getInitials(name?: string | null, email?: string | null) {
  const label = name || email || "?";
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatDate(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function SecuritySettingsTab() {
  const t = useTranslations("Settings");
  const router = useRouter();
  const { data: sessionData } = useSession();
  const activeSessionToken = sessionData?.session?.token ?? null;
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadSessions = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
        setError(null);
      }

      const result = await authClient.multiSession.listDeviceSessions();

      if (result.error) {
        setError(result.error.message ?? t("security_sessions_load_error"));
        setSessions([]);
        setIsLoading(false);
        return;
      }

      setSessions(Array.isArray(result.data) ? result.data : []);
      setIsLoading(false);
    },
    [t],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadSessions(false);
    });
  }, [loadSessions]);

  async function handleSetActive(sessionToken: string) {
    setPendingToken(sessionToken);
    const result = await authClient.multiSession.setActive({ sessionToken });

    if (result.error) {
      toast.error(result.error.message ?? t("security_switch_error"));
      setPendingToken(null);
      return;
    }

    toast.success(t("security_switch_success"));
    startTransition(() => {
      router.replace("/dashboard-redirect");
      router.refresh();
    });
  }

  async function handleRevoke(sessionToken: string) {
    const isCurrentSession = sessionToken === activeSessionToken;
    setPendingToken(sessionToken);
    const result = await authClient.multiSession.revoke({ sessionToken });

    if (result.error) {
      toast.error(result.error.message ?? t("security_revoke_error"));
      setPendingToken(null);
      return;
    }

    toast.success(t("security_revoke_success"));

    if (isCurrentSession) {
      startTransition(() => {
        router.replace("/sign-in");
        router.refresh();
      });
      return;
    }

    await loadSessions();
    setPendingToken(null);
  }

  return (
    <section className="flex flex-col gap-5 rounded-xl border bg-card p-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">{t("security_title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("security_description")}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-sm font-medium">{t("security_session_limit")}</p>
          <p className="text-sm text-muted-foreground">
            {t("security_session_limit_description")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => loadSessions()}
          disabled={isLoading || isPending}
        >
          <HugeiconsIcon icon={RefreshIcon} size={16} className="mr-1" />
          {t("security_refresh")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("security_no_sessions")}
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((deviceSession, index) => {
            const token = getSessionToken(deviceSession);
            const isActive = !!token && token === activeSessionToken;
            const user = deviceSession.user;
            const date =
              formatDate(deviceSession.session?.updatedAt) ??
              formatDate(deviceSession.session?.createdAt) ??
              formatDate(deviceSession.session?.expiresAt);
            const isBusy = pendingToken === token || isPending;

            return (
              <div
                key={token || index}
                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback>
                      {getInitials(user?.name, user?.email)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {user?.name ||
                          user?.email ||
                          t("security_unknown_user")}
                      </p>
                      {isActive && (
                        <Badge variant="secondary">
                          {t("security_active")}
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {user?.email ?? t("security_no_email")}
                    </p>
                    {date && (
                      <p className="text-xs text-muted-foreground">
                        {t("security_last_updated", { date })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {!isActive && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!token || isBusy}
                      onClick={() => handleSetActive(token)}
                    >
                      <HugeiconsIcon
                        icon={UserSwitchIcon}
                        size={16}
                        className="mr-1"
                      />
                      {isBusy ? t("security_working") : t("security_switch")}
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={!token || isBusy}
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          size={16}
                          className="mr-1"
                        />
                        {t("security_revoke")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("security_revoke_confirm_title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("security_revoke_confirm_description")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("security_revoke_confirm_cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => handleRevoke(token)}
                        >
                          {t("security_revoke_confirm_action")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
