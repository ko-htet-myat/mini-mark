import { getAuditLogs } from "@/features/audit-log/data/get-audit-logs";
import { AuditEntityType } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

// ─── Action display config ────────────────────────────────────────────────────

const ACTION_LABEL: Record<string, string> = {
  SUBSCRIPTION_REQUEST_APPROVED: "Request Approved",
  SUBSCRIPTION_REQUEST_REJECTED: "Request Rejected",
  PAYMENT_RECORDED: "Payment Recorded",
  SUBSCRIPTION_ACTIVATED: "Subscription Activated",
  SUBSCRIPTION_CANCELED: "Subscription Canceled",
  SUBSCRIPTION_EXPIRED: "Subscription Expired",
  SHOP_CREATED: "Shop Created",
  SHOP_UPDATED: "Shop Updated",
  SHOP_DELETED: "Shop Deleted",
};

const ACTION_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SUBSCRIPTION_REQUEST_APPROVED: "default",
  SUBSCRIPTION_REQUEST_REJECTED: "destructive",
  PAYMENT_RECORDED: "default",
  SUBSCRIPTION_ACTIVATED: "default",
  SUBSCRIPTION_CANCELED: "destructive",
  SUBSCRIPTION_EXPIRED: "destructive",
  SHOP_CREATED: "secondary",
  SHOP_UPDATED: "secondary",
  SHOP_DELETED: "destructive",
};

const ENTITY_LABEL: Record<AuditEntityType, string> = {
  SUBSCRIPTION_REQUEST: "Subscription Request",
  PAYMENT_RECORD: "Payment Record",
  SUBSCRIPTION: "Subscription",
  SHOP: "Shop",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

type SearchParams = {
  page?: string;
  pageSize?: string;
  entityType?: string;
};

export const metadata = {
  title: "Audit Log — Admin | Mini Market Myanmar",
  description: "Immutable event log for all admin and financial actions.",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const validEntityTypes = Object.values(AuditEntityType);
  const entityTypeFilter = validEntityTypes.includes(
    params.entityType as AuditEntityType,
  )
    ? (params.entityType as AuditEntityType)
    : undefined;

  const { data, total, page, totalPages } = await getAuditLogs({
    page: params.page,
    pageSize: params.pageSize,
    entityType: entityTypeFilter,
  });

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const p = new URLSearchParams({
      ...(params.page ? { page: params.page } : {}),
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...overrides,
    });
    return `/admin/audit-log?${p.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Audit Log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Immutable record of all subscription, payment, and shop management
          events. {total} total events.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl({ entityType: undefined, page: undefined })}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            !entityTypeFilter
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </Link>
        {validEntityTypes.map((et) => (
          <Link
            key={et}
            href={buildUrl({ entityType: et, page: undefined })}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              entityTypeFilter === et
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {ENTITY_LABEL[et]}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <p className="text-sm font-medium text-foreground">
              No audit events yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Events will appear here when admins take actions.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Action
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Entity
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Shop
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Actor
                </th>
                <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">
                  When
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((log) => {
                const meta = (log.metadata ?? {}) as Record<string, string>;
                const shopLabel = meta.shopSlug ?? log.shopId ?? "—";
                const entityLabel = ENTITY_LABEL[log.entityType];

                return (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    {/* Action */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={ACTION_VARIANT[log.action] ?? "outline"}
                        className="whitespace-nowrap text-xs"
                      >
                        {ACTION_LABEL[log.action] ?? log.action}
                      </Badge>
                    </td>

                    {/* Entity */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {entityLabel}
                      </span>
                      <br />
                      <span className="font-mono text-xs text-foreground/50">
                        {log.entityId.slice(0, 12)}…
                      </span>
                    </td>

                    {/* Shop */}
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="text-xs text-foreground">
                        {shopLabel}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-foreground">
                        {log.actorName}
                      </span>
                    </td>

                    {/* When */}
                    <td className="hidden px-4 py-3 text-right md:table-cell">
                      <span
                        title={log.createdAt.toISOString()}
                        className="text-xs text-muted-foreground"
                      >
                        {formatDistanceToNow(log.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages} &middot; {total} events
          </p>
          <div className="flex gap-2">
            {page > 0 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                Previous
              </Link>
            )}
            {page + 1 < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
