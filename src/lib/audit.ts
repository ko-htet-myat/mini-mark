import { AuditAction, AuditEntityType } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

// ─── Metadata types per action ────────────────────────────────────────────────
// Each action carries a typed payload so callers can't write mis-shaped data.

export type AuditMetadata =
  | {
      action: "SUBSCRIPTION_REQUEST_APPROVED";
      planName: string;
      shopSlug: string;
    }
  | {
      action: "SUBSCRIPTION_REQUEST_REJECTED";
      planName: string;
      shopSlug: string;
      rejectionReason?: string;
    }
  | {
      action: "PAYMENT_RECORDED";
      amount: string;
      currency: string;
      method: string;
      shopSlug: string;
    }
  | {
      action: "SUBSCRIPTION_ACTIVATED";
      planName: string;
      shopSlug: string;
    }
  | {
      action: "SUBSCRIPTION_CANCELED";
      planName: string;
      shopSlug: string;
    }
  | {
      action: "SUBSCRIPTION_EXPIRED";
      planName: string;
      shopSlug: string;
    }
  | {
      action: "SHOP_CREATED";
      shopSlug: string;
      shopName: string;
    }
  | {
      action: "SHOP_UPDATED";
      shopSlug: string;
      shopName: string;
    }
  | {
      action: "SHOP_DELETED";
      shopSlug: string;
      shopName: string;
    };

// ─── Entry type ───────────────────────────────────────────────────────────────

export type AuditEntry = {
  actorId: string;
  actorName: string;
  entityId: string;
  shopId?: string | null;
} & AuditMetadata;

// ─── Transaction type alias ───────────────────────────────────────────────────

type PrismaTransaction = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// ─── Utility ──────────────────────────────────────────────────────────────────

const ACTION_TO_ENTITY: Record<AuditAction, AuditEntityType> = {
  SUBSCRIPTION_REQUEST_APPROVED: "SUBSCRIPTION_REQUEST",
  SUBSCRIPTION_REQUEST_REJECTED: "SUBSCRIPTION_REQUEST",
  PAYMENT_RECORDED: "PAYMENT_RECORD",
  SUBSCRIPTION_ACTIVATED: "SUBSCRIPTION",
  SUBSCRIPTION_CANCELED: "SUBSCRIPTION",
  SUBSCRIPTION_EXPIRED: "SUBSCRIPTION",
  SHOP_CREATED: "SHOP",
  SHOP_UPDATED: "SHOP",
  SHOP_DELETED: "SHOP",
};

/**
 * Write an immutable audit log entry inside a Prisma transaction.
 *
 * Always call this inside `prisma.$transaction(...)` so the audit write
 * is atomic with the originating mutation.
 *
 * @example
 * await prisma.$transaction(async (tx) => {
 *   const shop = await tx.shop.create({ ... });
 *   await writeAuditLog(tx, {
 *     actorId: user.id, actorName: user.name,
 *     action: "SHOP_CREATED", entityId: shop.id,
 *     shopId: shop.id, shopSlug: shop.slug, shopName: shop.name,
 *   });
 * });
 */
export async function writeAuditLog(
  tx: PrismaTransaction,
  entry: AuditEntry,
): Promise<void> {
  const { actorId, actorName, action, entityId, shopId, ...metadata } = entry;

  await tx.auditLog.create({
    data: {
      actorId,
      actorName,
      action,
      entityType: ACTION_TO_ENTITY[action],
      entityId,
      shopId: shopId ?? null,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    },
  });
}
