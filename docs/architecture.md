# Architecture � Mini Market Myanmar

## System Overview

This is a **Next.js 16 App Router** monolith backed by **PostgreSQL** via **Prisma ORM**. All server logic lives in the same process; there is no separate API service. The app is deployed as a single Next.js application.

```
Browser / Client
      �
      
Next.js App Router (src/app)
  ?�� Server Components  �� Prisma (direct DB access)
  ?�� Server Actions     �� next-safe-action  Prisma
  ��� API Routes         �� Better Auth handler
                              ��� Cloudinary signed-upload
                                   ��� Cloudinary (image CDN)
      �
      
PostgreSQL (via @prisma/adapter-pg + pg pool)
```

---

## Directory Structure

```
d:/solo/test/
?�� prisma/
�   ?�� schema.prisma          # Single source of truth for DB schema
�   ?�� migrations/            # Prisma migration history
�   ��� seed.ts                # DB seed script
?�� src/
�   ?�� app/                   # Next.js App Router pages & layouts
�   �   ?�� (auth)/            # Sign-in / sign-up (public, unauthenticated)
�   �   ?�� (onboarding)/      # Create shop + dashboard-redirect
�   �   ?�� (public)/          # Landing page, shops directory
�   �   ?�� [shop]/            # Per-shop public storefront + dashboard
�   �   �   ?�� page.tsx       # Shop home / product listing
�   �   �   ?�� products/      # Product detail pages
�   �   �   ?�� cart/          # Cart page (stub)
�   �   �   ��� dashboard/     # Owner dashboard (auth-gated)
�   �   �       ?�� products/
�   �   �       ?�� categories/
�   �   �       ?�� brands/
�   �   �       ?�� attributes/
�   �   �       ?�� promotions/
�   �   �       ?�� orders/
�   �   �       ?�� sales/
�   �   �       ?�� invoices/
�   �   �       ?�� calculator/
�   �   �       ?�� settings/
�   �   �       ��� theme/
�   �   ��� api/
�   �       ?�� auth/          # Better Auth catch-all route
�   �       ��� sign-cloudinary-params/  # Signed upload endpoint
�   ?�� features/              # Feature modules (collocated logic)
�   �   ?�� auth/
�   �   ?�� shop/
�   �   ?�� products/
�   �   ?�� categories/
�   �   ?�� brands/
�   �   ?�� attributes/
�   �   ?�� promotions/
�   �   ?�� cloudinary/
�   �   ��� settings/
�   ?�� components/
�   �   ?�� ui/                # shadcn/ui primitives (Radix-based)
�   �   ?�� layout/            # Sidebar, header, breadcrumb, footer
�   �   ?�� common/            # Shared non-feature components
�   �   ?�� language-switcher.tsx
�   �   ?�� theme-provider.tsx
�   �   ��� theme-switcher.tsx
�   ?�� lib/
�   �   ?�� auth.ts            # Better Auth server config
�   �   ?�� auth-client.ts     # Better Auth browser client
�   �   ?�� prisma.ts          # Prisma client singleton (pg adapter)
�   �   ?�� safe-action.ts     # next-safe-action client hierarchy
�   �   ?�� query.tsx          # TanStack Query provider
�   �   ?�� get-session.ts     # Server session helper
�   �   ?�� language.ts        # Locale helpers
�   �   ?�� parse-pagination.ts
�   �   ��� utils.ts           # clsx + tailwind-merge helper
�   ?�� hooks/                 # Custom React hooks
�   ?�� store/                 # Zustand global stores
�   ?�� i18n/
�   �   ��� request.ts         # next-intl request config
�   ?�� styles/
�   �   ��� globals.css        # Tailwind v4 + shadcn tokens
�   ��� generated/
�       ��� prisma/            # Generated Prisma client output
?�� messages/
�   ?�� en.json                # English translations
�   ��� mm.json                # Myanmar translations
��� docs/                      # This documentation folder
```

---

## Feature Module Convention

Each feature under `src/features/<name>/` follows:

```
<feature>/
?�� actions/        # next-safe-action server actions (mutations)
?�� components/     # React components specific to this feature
?�� data/           # Read-only Prisma query helpers (server-only)
?�� hooks/          # Feature-specific client hooks
��� validations/    # Zod schemas shared between actions and forms
```

---

## Authentication & Authorisation

| Layer                | Tool                                  | Role                                                    |
| -------------------- | ------------------------------------- | ------------------------------------------------------- |
| Authentication       | **Better Auth**                       | Session management, OAuth, email/password               |
| Server Actions guard | `authClient` (safe-action middleware) | Redirects to `/sign-in` if unauthenticated              |
| Shop ownership guard | `shopOwnerActionClient`               | Verifies the calling user owns the shop slug in the URL |
| Admin actions        | Not yet implemented in UI             | Performed directly or via Prisma Studio                 |

### Safe Action Client Hierarchy

```
actionClient (base � error handling only)
  ��� authClient (+ Better Auth middleware)
        ��� shopOwnerActionClient (+ shop ownership bind-arg check)
```

---

## Database

- **Provider**: PostgreSQL
- **ORM**: Prisma v7 with `@prisma/adapter-pg` (connection-pool via `pg`)
- **Client output**: `src/generated/prisma`
- **Key models**:

| Model                                                    | Purpose                                                                                  |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `User`                                                   | Auth identity; one-to-one with `Shop`                                                    |
| `Session` / `Account` / `Verification`                   | Better Auth managed tables                                                               |
| `Shop`                                                   | Tenant unit; all resources scoped to it                                                  |
| `Product`                                                | Core catalogue item with pricing, stock, images                                          |
| `Category`                                               | Hierarchical (self-referential)                                                          |
| `Brand`                                                  | Product grouping with logo                                                               |
| `Attribute` + `AttributeValue` + `ProductAttributeValue` | Flexible EAV-style attributes with per-value extra price                                 |
| `Promotion`                                              | Discounts (percentage / fixed); optional promo codes; targets products/categories/brands |
| `Plan`                                                   | Subscription tiers with price and limits                                                 |
| `Subscription`                                           | Active plan for a shop                                                                   |
| `SubscriptionRequest`                                    | Manual upgrade request flow                                                              |
| `PaymentRecord`                                          | Manual bookkeeping of payments                                                           |

---

## Image Storage

- All images are uploaded to **Cloudinary** via `next-cloudinary`
- The server generates a signed upload signature at `/api/sign-cloudinary-params`
- `CldImage` / `next-cloudinary` components render images with `res.cloudinary.com` CDN
- `next.config.ts` allows `res.cloudinary.com` as a remote image pattern

---

## Internationalisation

- Library: **next-intl v4**
- Plugin wraps Next.js config: `createNextIntlPlugin()`
- Message files: `messages/en.json`, `messages/mm.json`
- Locale is read per-request via `src/i18n/request.ts`
- Myanmar locale triggers custom `Noto Sans Myanmar` font and adjusted font-size/line-height in CSS

---

## Key Invariants

1. Every resource (product, category, brand, etc.) is **scoped to a Shop** � cross-shop data access is prevented by always filtering `WHERE shopId = ...`
2. **One shop per user** � enforced by `@unique` on `Shop.ownerId`
3. **Shop ownership** is verified server-side in every mutating action via `shopOwnerActionClient`
4. **Email verification** is required before a user can log in
5. Prisma client is a **singleton** managed in `src/lib/prisma.ts` using the `pg` connection pool adapter
