# Spec: Audit Log System

**Date:** 2026-08-03
**Status:** Draft — awaiting human approval

---

## What & Why

Mini Market Myanmar is a financial SaaS platform where admins manually approve subscription requests, record payments, and activate subscriptions. Currently there is **no event log** for any of these actions. This is a compliance gap: if a payment is disputed, a subscription status is wrong, or an admin action needs to be investigated, there is no traceable history.

This spec defines an **append-only `AuditLog` table** that records who did what, to which entity, and when — for all financially significant and shop-management events.

---

## Acceptance Criteria

1. Every admin action on a `SubscriptionRequest` (approve / reject) writes an audit log entry.
2. Every `PaymentRecord` creation writes an audit log entry.
3. Every `Subscription` status change (activate, cancel, expire) writes an audit log entry.
4. Every shop CRUD action (create, update, delete) writes an audit log entry.
5. Each log entry records: `actorId`, `actorName`, `action` (enum), `entityType` (enum), `entityId`, `shopId` (nullable), `metadata` (JSON — stores diff or key details), `createdAt`.
6. Log entries are **immutable** — no update or delete is ever performed on them.
7. A server action exists to query audit logs filtered by `entityType`, `entityId`, or `shopId`.
8. A minimal **Admin Audit Log page** exists at `/admin/audit-log` that lists recent events with actor, action, target, and timestamp.
9. All audit writes are wrapped in the same Prisma transaction as the originating mutation.

---

## Out of Scope (This Spec)

- Audit logging for product/category/brand/attribute/promotion CRUD (catalogue changes — follow-up spec).
- Email notifications triggered by audit events.
- Audit log export (CSV / Excel).
- Full admin dashboard RBAC.
- Retention / archival policy.

---

## Entities Covered

| Entity                | Actions Logged                                                            |
| --------------------- | ------------------------------------------------------------------------- |
| `SubscriptionRequest` | `SUBSCRIPTION_REQUEST_APPROVED`, `SUBSCRIPTION_REQUEST_REJECTED`          |
| `PaymentRecord`       | `PAYMENT_RECORDED`                                                        |
| `Subscription`        | `SUBSCRIPTION_ACTIVATED`, `SUBSCRIPTION_CANCELED`, `SUBSCRIPTION_EXPIRED` |
| `Shop`                | `SHOP_CREATED`, `SHOP_UPDATED`, `SHOP_DELETED`                            |

---

## Data Model (Proposed)

```prisma
enum AuditAction {
  SUBSCRIPTION_REQUEST_APPROVED
  SUBSCRIPTION_REQUEST_REJECTED
  PAYMENT_RECORDED
  SUBSCRIPTION_ACTIVATED
  SUBSCRIPTION_CANCELED
  SUBSCRIPTION_EXPIRED
  SHOP_CREATED
  SHOP_UPDATED
  SHOP_DELETED
}

enum AuditEntityType {
  SUBSCRIPTION_REQUEST
  PAYMENT_RECORD
  SUBSCRIPTION
  SHOP
}

model AuditLog {
  id         String          @id @default(cuid())
  actorId    String          // user who performed the action
  actorName  String          // snapshot of user.name at write time
  action     AuditAction
  entityType AuditEntityType
  entityId   String          // PK of the affected record
  shopId     String?         // null for platform-level actions
  metadata   Json?           // arbitrary context (e.g. old/new status, plan name)
  createdAt  DateTime        @default(now())

  @@index([entityType, entityId])
  @@index([shopId])
  @@index([actorId])
  @@index([createdAt])
  @@map("audit_log")
}
```

> **No FK relations to `User` or `Shop`** — intentional. Logs must survive actor/shop deletion. `actorName` is snapshotted at write time.

---

## Open Questions

1. **Admin auth guard** — Does `/admin/audit-log` gate on `role === ADMIN`? Should it use the existing `UserRole.ADMIN` enum, or wait for a full RBAC spec?
   _Suggested_: Gate on `UserRole.ADMIN` immediately. Minimal, consistent with existing enum.

2. **Shop-owner visibility** — Can shop owners see audit events scoped to their own shop, or is the log admin-only?
   _Suggested_: Admin-only for now.

3. **`metadata` schema** — Typed TypeScript discriminated unions at write time, or free-form JSON?
   _Suggested_: Typed helpers per `AuditAction` at write time; stored as free-form JSON in Postgres.

4. **Pagination** — Use existing `parsePagination` offset helper or cursor-based?
   _Suggested_: Use `parsePagination` for consistency.
