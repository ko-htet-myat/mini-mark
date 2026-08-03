import "server-only";
import { prisma } from "@/lib/prisma";
import { AuditEntityType } from "@/generated/prisma/client";
import { parsePagination } from "@/lib/parse-pagination";

export type GetAuditLogsParams = {
  page?: string;
  pageSize?: string;
  entityType?: AuditEntityType;
  entityId?: string;
  shopId?: string;
};

export type AuditLogRow = Awaited<
  ReturnType<typeof getAuditLogs>
>["data"][number];

export async function getAuditLogs(params: GetAuditLogsParams = {}) {
  const { page, pageSize } = parsePagination({
    page: params.page,
    pageSize: params.pageSize,
  });

  const where = {
    ...(params.entityType ? { entityType: params.entityType } : {}),
    ...(params.entityId ? { entityId: params.entityId } : {}),
    ...(params.shopId ? { shopId: params.shopId } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
