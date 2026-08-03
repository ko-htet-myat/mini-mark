# 🏪 Mini Market Myanmar — SaaS Production Readiness Audit

> Reviewed: 2026-08-03 | Stack: Next.js 16 · Prisma 7 · PostgreSQL · Better Auth · next-safe-action · TanStack Query · Tailwind v4 · Cloudinary · next-intl

---

## Executive Summary

Your project is **architecturally well-structured and follows modern SaaS best practices** at the foundational level. The tech choices are solid, the conventions are consistent, and the security boundaries are well-defined. For an early-stage Myanmar-focused marketplace, this is genuinely impressive groundwork.

| Category              | Score    | Status             |
| --------------------- | -------- | ------------------ |
| Project Structure     | 9 / 10   | ✅ Excellent       |
| Coding Standards      | 8.5 / 10 | ✅ Very Good       |
| Security Architecture | 8 / 10   | ✅ Good            |
| Database Design       | 9 / 10   | ✅ Excellent       |
| Business Logic Flow   | 8 / 10   | ✅ Good            |
| Test Coverage         | 5 / 10   | ⚠️ Needs Work      |
| Production Readiness  | 6.5 / 10 | ⚠️ Partially Ready |

---

## 1. Project Structure — ✅ Excellent (9/10)

### What's Great

**Feature-module architecture** is the standout win. Each feature lives in:

```
src/features/<name>/
  actions/      ← server mutations (next-safe-action)
  components/   ← scoped React components
  data/         ← read-only Prisma queries
  hooks/        ← client hooks
  validations/  ← Zod schemas
```

This collocates all concerns for a feature, making it easy to reason about, test, and delete without side effects. This is the **correct pattern** for a growing SaaS codebase.

**Route group discipline** is clean:

```
(auth)/       → public unauthenticated pages
(onboarding)/ → post-signup flow
(public)/     → landing page
[shop]/       → per-tenant storefront + dashboard
```

The `[shop]` dynamic segment correctly scopes everything under a tenant slug — this is the right multi-tenancy approach for a monolith.

**Documentation-first culture** is impressive. Having 6 living docs (`project-overview`, `architecture`, `ui-context`, `code-standards`, `ai-workflow-rules`, `progress-tracker`) that are mandated reading before any implementation is a **senior engineering practice** rarely seen in early-stage projects.

**Spec-driven workflow** (`specs/<date>-<name>/spec.md → plan.md → tasks.md`) prevents scope creep and creates an audit trail of all decisions — production-grade process.

### Minor Issues

- `package.json` still has `"name": "test"` — should be renamed to the real product name before any npm publishing or Docker tagging
- `src/context/` (only `shop-context.tsx`) could live under `src/features/shop/` to keep the flat root `src/` clean

---

## 2. Coding Standards — ✅ Very Good (8.5/10)

### What's Great

**TypeScript strict mode** is enforced across the board. The custom Prisma client output (`src/generated/prisma`) and the rule "never import from `@prisma/client` directly" prevents version drift — smart.

**Safe action client hierarchy** is textbook:

```
actionClient          ← base error handling
  └─ authClient       ← Better Auth middleware
       └─ shopOwnerActionClient  ← ownership guard (bind-arg)
```

The `shopOwnerActionClient` using a **bind-arg schema** (`z.object({ shop: z.string() })`) to carry the shop slug into the middleware is an elegant, type-safe solution. The ownership check (`shop.ownerId !== ctx.auth.user.id`) happens server-side on every mutation — this is correct zero-trust architecture.

**Prisma error mapping** is done correctly:

```ts
if (err.code === "P2002")
  throw new Error("A product with this slug already exists.");
if (err.code === "P2025") throw new Error("Product not found.");
```

Raw Prisma messages never leak to the client. ✅

**Form handling** (react-hook-form + Zod resolver + `useHookFormAction`) is the correct full-stack validated pattern — schema is defined once and shared between server action and form.

**Singleton Prisma client** with `globalThis` guard prevents connection pool exhaustion in Next.js HMR. ✅

**`pg` connection pool adapter** (`@prisma/adapter-pg`) instead of naive Prisma connection strings is the production-correct choice for serverless/edge deployments. ✅

### Issues Found

| Severity  | Issue                                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ⚠️ Medium | `duplicateProduct` action has no `try/catch` — if the `findUnique` or `create` fails with a DB error, it will bubble as an unhandled rejection instead of a clean server error |
| ⚠️ Medium | All i18n strings must use `next-intl` per standards — worth auditing server components that might have hardcoded English strings                                               |
| 🔵 Low    | No `server-only` package import guard on data-layer files (`features/*/data/`) — a client component could accidentally import a server Prisma query                            |
| 🔵 Low    | `src/proxy.ts` (800 bytes) is unexplained — document its purpose or move it to a feature module                                                                                |

---

## 3. Security Architecture — ✅ Good (8/10)

### What's Great

- **Disposable email blocking** at account creation via `disposable-email-domains` — prevents spam shops ✅
- **Email verification required** before login ✅
- **Rate limiting**: 5 req / 60s window on auth endpoints ✅
- **Session cookie caching** (5-min TTL) reduces DB load while keeping sessions fresh ✅
- **Google OAuth with account linking** — users can merge email + Google accounts ✅
- **`poweredByHeader: false`** in `next.config.ts` — removes the `X-Powered-By: Next.js` fingerprint ✅
- **Cross-tenant isolation**: every DB query scopes by `shopId` — verified in schema with `@@unique([shopId, slug])` on all slug fields ✅
- **Shop ownership verified server-side** in `shopOwnerActionClient` on every mutation ✅
- **Cloudinary signed uploads** — the server signs params, so clients cannot upload to arbitrary paths ✅

### Gaps

| Severity  | Gap                                                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴 High   | **No CSRF protection** configured in Better Auth — `trustedOrigins` is not set. Cross-origin form submissions are not blocked                                                                                    |
| 🔴 High   | **Admin role has no UI guard** — `UserRole.ADMIN` exists in the schema, but admin actions happen "via API / direct DB". Any admin API endpoint built later could lack route-level protection                     |
| ⚠️ Medium | **No Content Security Policy (CSP) headers** — `next.config.ts` has no `headers()` function. In production, this is a mandatory hardening step                                                                   |
| ⚠️ Medium | **`GOOGLE_CLIENT_SECRET` is accessed with `!` (non-null assertion)** — if the env var is missing, the app silently continues and crashes at runtime. Use explicit validation (e.g., `t3-env` or a startup check) |
| 🔵 Low    | **No audit log** — subscription approvals, payment records, and shop management have no event log. For a financial SaaS, this is a compliance gap                                                                |

---

## 4. Database Design — ✅ Excellent (9/10)

### What's Great

The schema is thoughtfully designed for a multi-tenant commerce platform:

**Tenant isolation** is enforced at the schema level:

- Every resource (`Product`, `Category`, `Brand`, `Attribute`, `Promotion`) has `shopId` with a DB-level foreign key and cascade delete
- `@@unique([shopId, slug])` prevents slug collisions within a shop while allowing the same slug across different shops

**Product variant model** is properly normalized:

```
Product → ProductVariant → ProductVariantAttributeValue → AttributeValue → Attribute
```

This EAV (Entity-Attribute-Value) hybrid is the right call for flexible product attributes (Size, Color, etc.) without a fixed schema.

**Order snapshot pattern** is excellent:

```prisma
// snapshots — protect historical orders from later catalog edits
productName  String
variantLabel String?
sku          String?
price        Decimal  // unit price at time of order
```

Copying product data into `OrderItem` at order-creation time means historical orders remain accurate even after the shop owner edits or deletes a product. This is a **critical correctness invariant** many beginners miss.

**Subscription model** is well-designed for a manual-billing SaaS:

- `Plan` → `Subscription` → `SubscriptionRequest` → `PaymentRecord` flow maps precisely to the real-world manual approval process
- `SubscriptionStatus` enum (`TRIALING`, `ACTIVE`, `EXPIRED`, `CANCELED`, `PENDING_ACTIVATION`) covers all lifecycle states

**Indexes** are present on all foreign keys and frequently filtered fields (`shopId`, `status`, `currentPeriodEnd`, etc.)

### Issues Found

| Severity  | Issue                                                                                                                                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ⚠️ Medium | `Plan.interval` (`MONTHLY`/`YEARLY`) is on the plan itself — this means "Starter Monthly" and "Starter Yearly" are separate Plan rows. This is workable but makes UI plan comparison harder; consider a `PlanPrice` junction |
| ⚠️ Medium | `Plan.currency` is a `String` (default `"USD"`) but `Shop.currency` is a typed `Currency` enum — inconsistency. Subscription pricing in USD vs shop currency in MMK could cause confusion                                    |
| 🔵 Low    | `Invoice` model has `invoiceNumber` but no generation logic documented — the uniqueness constraint `@@unique([orderId, invoiceNumber])` could be violated if generation logic isn't atomic                                   |
| 🔵 Low    | No `deletedAt` soft-delete on `Product`, `Shop`, etc. — hard deletes cascade and destroy historical order data relationships via `SetNull`                                                                                   |

---

## 5. Business Logic Flow — ✅ Good (8/10)

### User Journey Map

```
Sign Up → Email Verification
    ↓
Sign In → Redirect check
    ↓
No Shop? → /onboarding/create-shop
    ↓
Has Shop? → /{shop}/dashboard
    ↓
┌─────────────────────────────────────┐
│  Dashboard                          │
│  Products / Categories / Brands     │
│  Attributes / Promotions            │
│  (Orders / Sales / Invoices stubs)  │
└─────────────────────────────────────┘
    ↓
Public Storefront /{shop}
  ↓ Product listing (filter by category/brand)
  ↓ Product detail (variant selection)
  ↓ Cart (add/remove, quantity)
  ↓ [Checkout — NOT YET IMPLEMENTED]
```

### Subscription Flow

```
Shop Owner → Submit SubscriptionRequest (plan + contact phone/message)
    ↓
Admin reviews → APPROVED / REJECTED
    ↓
APPROVED → Admin records PaymentRecord
    ↓
Admin activates Subscription → status: ACTIVE
    ↓
Shop features gated by Plan limits (productLimit, orderLimit)
```

This manual flow is a **pragmatic business decision** for Myanmar's market where automated payment gateways (Stripe, etc.) aren't yet viable. It's correct for the current phase.

### What's Well-Implemented

- **One shop per user** enforced at DB level (`@unique ownerId`) and prevents duplicate onboarding ✅
- **Promotion system** is flexible: percentage OR fixed, optional promo codes, date-ranged, target products/categories/brands or shop-wide ✅
- **Variant selection** correctness fix (disabled impossible combinations) is a real UX improvement ✅
- **Bilingual support** (English + Myanmar) with `next-intl` and correct font switching (`Noto Sans Myanmar`) is production-quality i18n ✅
- **Cart state** with Zustand + drawer preview is a good UX pattern ✅

### Gaps in Business Flow

| Gap                                                                                                            | Impact                                              |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **No checkout flow** — cart exists but no order creation from customer side                                    | Customers can't actually buy anything               |
| **No subscription gate enforcement** — `Plan.productLimit` exists but there's no check when creating a product | A "Starter" plan user can create unlimited products |
| **Admin dashboard is DB/API only** — admins must use Prisma Studio to approve subscriptions                    | Completely blocks any non-technical admin           |
| **Password reset flow missing** — users who forget their password have no self-service recovery                | Auth is incomplete for production                   |
| **No order notification** — when an order is placed, shop owners have no alert (email/SMS)                     | Shop owners will miss orders                        |

---

## 6. Test Coverage — ⚠️ Needs Work (5/10)

### What Exists

You have **server action unit tests** for all core CRUD modules:

| Test File                   | Actions Covered                           |
| --------------------------- | ----------------------------------------- |
| `products.test.ts`          | create, update, delete, toggle, duplicate |
| `categories.test.ts`        | CRUD                                      |
| `brands.test.ts`            | CRUD                                      |
| `attributes.test.ts`        | CRUD                                      |
| `promotions.test.ts`        | CRUD                                      |
| `shop.test.ts`              | create shop                               |
| `auth.test.ts`              | auth actions                              |
| `variant-selection.test.ts` | storefront logic                          |

The mocking pattern (hoisted `vi.hoisted()`, mocked `@/lib/safe-action`, mocked Prisma) is **correct and sophisticated** — especially mocking the safe-action middleware chain.

### Coverage Gaps

| Missing                                                                                                   | Risk                                     |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **No integration tests** — tests are all unit tests with mocked Prisma. No test verifies real DB behavior | Silent bugs from query logic             |
| **No E2E tests** (Playwright/Cypress)                                                                     | User flows are entirely unverified       |
| **No component tests** — React components have zero test coverage                                         | UI regressions go undetected             |
| **No API route tests** — `/api/sign-cloudinary-params` is untested                                        | Security gap in the upload signing logic |
| **Only 2 utility/domain tests** (`utils.test.ts`, `variant-selection.test.ts`)                            | Core domain logic has thin coverage      |

> [!IMPORTANT]
> The rule "Never mark a task complete without running its associated tests" is excellent — but the test suite currently covers only the happy path of server actions. Expand to include integration tests before going live.

---

## 7. Production Readiness Checklist

### ✅ Ready

- [x] TypeScript strict mode
- [x] PostgreSQL with connection pooling
- [x] Multi-tenant data isolation
- [x] Auth (email/password + OAuth + rate limit + email verification)
- [x] Signed CDN image uploads (Cloudinary)
- [x] Pre-commit hooks (Husky + lint-staged)
- [x] Prisma migration history tracked
- [x] i18n with dual locale
- [x] Server-side ownership verification on all mutations
- [x] Order data snapshot integrity

### ⚠️ Needs Completion Before Launch

- [ ] CSRF trusted origins configured in Better Auth
- [ ] CSP and security headers in `next.config.ts`
- [ ] Environment variable validation at startup (not runtime `!` assertions)
- [ ] Password reset flow
- [ ] Subscription limit enforcement in actions
- [ ] Admin dashboard UI (at minimum: subscription approval)
- [ ] Customer checkout flow (order creation)
- [ ] Email notifications for orders
- [ ] Error monitoring (Sentry or equivalent)
- [ ] Structured logging (Pino / Winston)

### 🔴 Critical Gaps for Any Real Revenue

- [ ] Checkout flow with order creation
- [ ] Admin can approve/reject subscription requests via UI
- [ ] Plan feature-gating is actually enforced in code

---

## 8. Real-World Business Impact

> How does this architecture translate to real business outcomes?

### Positive Impact

| Architectural Choice                        | Real-World Effect                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Multi-tenant slug routing** `/{shop}/...` | Every shop owner gets their own branded URL instantly. No infrastructure work needed per tenant.                    |
| **Cloudinary CDN for images**               | Product images load fast globally. No server storage cost. Automatic image optimization.                            |
| **Manual subscription approval**            | Sales team can qualify leads before they activate. Matches Myanmar's relationship-based B2B culture.                |
| **Bilingual (EN + Myanmar)**                | Expands addressable market to all Myanmar users, including non-English readers. Critical for local adoption.        |
| **EAV product variants**                    | Shop owners can sell anything from T-shirts (S/M/L, Red/Blue) to electronics (RAM/Storage) with one unified schema. |
| **Order snapshot data**                     | Historical sales reports are always accurate, even after product edits or deletions. Builds trust with shop owners. |
| **Spec-driven workflow**                    | Feature delivery is predictable. New team members have context. Reduces rework.                                     |

### Business Risks (from current gaps)

| Risk                                                               | Probability | Impact                                        |
| ------------------------------------------------------------------ | ----------- | --------------------------------------------- |
| Shop owners discover products aren't actually gated by plan limits | Medium      | High — subscription revenue model breaks down |
| A customer tries to checkout and the flow doesn't exist            | High        | Critical — zero sales possible                |
| Admin manually approving subscriptions via Prisma Studio           | Certain     | High — not scalable beyond 10 shops           |
| User forgets password and can't recover                            | High        | Medium — churn on signup friction             |

---

## 9. Recommendations (Priority Order)

### 🔴 Do First (Blockers)

1. **Build the checkout flow** — order creation from cart. This is the core transaction in a marketplace.
2. **Build admin subscription UI** — at minimum: list pending requests, approve/reject, record payment.
3. **Enforce plan limits** — add a `getPlanLimits()` helper called in `createProduct` / `createOrder` actions.
4. **Implement password reset** — use Better Auth's built-in email reset flow.

### 🟡 Do Next (Production Hardening)

5. **Configure CSRF trusted origins** in `better-auth` config.
6. **Add security headers** (`Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`) via `next.config.ts` `headers()`.
7. **Validate env vars at startup** — use `t3-env` or a `src/env.ts` module that throws on missing required vars.
8. **Add Sentry** (or similar) for error monitoring.
9. **Add order notification emails** — shop owner receives email when a new order is placed.

### 🟢 Improve Over Time

10. **Add `server-only`** imports to all `features/*/data/` files.
11. **Write integration tests** against a test DB (use `@prisma/client` + a test Postgres instance).
12. **Add E2E tests** for critical flows (sign-up → create shop → create product → checkout).
13. **Rename `package.json` `"name"`** from `"test"` to `"mini-market-myanmar"`.
14. **Add soft-delete** (`deletedAt`) to `Product` and `Shop` to preserve data integrity.

---

## Summary Verdict

> **This is a well-engineered foundation for a real SaaS product.** The architecture, conventions, database design, and security boundaries are all thoughtfully designed. The primary gap is that **the core revenue loop is incomplete** — customers cannot yet place orders and admins cannot manage subscriptions through a UI. Fix those three blockers and this is ready for a private beta with real shop owners.

The Myanmar-specific choices (bilingual support, manual payment approval, MMK currency) show genuine market understanding. This is not a generic template — it's built for a real context.
