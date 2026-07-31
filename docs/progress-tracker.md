# Progress Tracker � Mini Market Myanmar

_Last updated: 2026-07-31_

---

## Current Phase

**Phase: Active Development � Core Dashboard Features**

The authentication, onboarding, and product/category/brand/attribute management modules are implemented. The subscription system data model is complete. Several dashboard sections (orders, sales, invoices, calculator, theme) exist as route stubs awaiting implementation.

---

## Completed Work

### Infrastructure

- [x] Next.js 16 App Router setup with TypeScript
- [x] Tailwind CSS v4 + shadcn/ui (radix-vega style) integration
- [x] PostgreSQL database with Prisma ORM (v7, `@prisma/adapter-pg`)
- [x] Better Auth (email/password + Google OAuth, email verification, rate limiting)
- [x] next-safe-action client hierarchy (`actionClient`  `authClient`  `shopOwnerActionClient`)
- [x] next-intl i18n (English + Myanmar locale, language switcher)
- [x] Cloudinary image upload (signed uploads via `/api/sign-cloudinary-params`)
- [x] TanStack Query provider
- [x] Husky + lint-staged pre-commit hooks
- [x] Vitest test runner

### Authentication

- [x] Sign-up page (email/password + Google OAuth)
- [x] Sign-in page (email/password + Google OAuth)
- [x] Disposable email domain blocking
- [x] Email verification requirement
- [x] Session cookie caching

### Onboarding

- [x] Create Shop page (`/onboarding/create-shop`)
- [x] Dashboard redirect after shop creation

### Database Schema

- [x] `User`, `Session`, `Account`, `Verification` (Better Auth tables)
- [x] `Shop` (tenant unit)
- [x] `Category` (hierarchical)
- [x] `Brand`
- [x] `Product` (with compare-at price, images, YouTube URL, stock, active toggle)
- [x] `Attribute` + `AttributeValue` + `ProductAttributeValue` (EAV with extra price)
- [x] `Promotion` (percentage/fixed, promo codes, targets products/categories/brands)
- [x] `Plan`, `Subscription`, `SubscriptionRequest`, `PaymentRecord` (manual billing)

### Dashboard Features

- [x] Products CRUD (create, update, delete, toggle active)
- [x] Categories CRUD
- [x] Brands CRUD
- [x] Attributes CRUD
- [x] Promotions CRUD
- [x] Dashboard sidebar with navigation

### Public Storefront

- [x] Shop home page (`/{shop}`)
- [x] Product listing
- [x] Product detail page (`/{shop}/products/{productId}`) — rewired to current schema (variants + attribute values), fixed type and data query
- [x] Public product list page (`/{shop}/products`) — category + brand chip filters, pagination, breadcrumb, i18n, `generateMetadata`
- [x] Public footer (i18n-aware)

---

## In Progress

- [ ] Settings feature � shop profile editing components
- [x] Public storefront cart (`/{shop}/cart`)

---

## Pending / Not Started

### Dashboard Sections (Route stubs only)

- [ ] Orders management (`/{shop}/dashboard/orders`)
- [ ] Sales analytics (`/{shop}/dashboard/sales`)
- [ ] Invoice management (`/{shop}/dashboard/invoices`)
- [ ] Calculator tool (`/{shop}/dashboard/calculator`)
- [ ] Theme customisation (`/{shop}/dashboard/theme`)

### Subscription System

- [ ] Subscription request flow UI (shop owner side)
- [ ] Plan listing/comparison page
- [ ] Admin review UI for subscription requests
- [ ] Payment record UI

### Public Storefront

- [x] Cart functionality (add/remove items, quantity)
- [ ] Shops directory page (`/shops`)

### Other

- [ ] Admin dashboard (user management, shop oversight)
- [ ] Password reset flow
- [x] Product list Excel export (filtered dashboard export via exceljs)
- [ ] AI features (ai SDK v7 installed, not integrated)

---

## Open Questions

1. **Admin UI** � Will there be a dedicated admin panel route, or will admin actions remain API/DB only?
2. **Orders** � What is the order creation flow? Customer-initiated cart  checkout, or manual shop-owner entry?
3. **Theme customisation** � What aspects of the shop theme can owners customise (colours, logo only)?
4. **Cart persistence** � Session-based, localStorage, or DB-backed cart?
5. **Excel export** � Which data needs to be exported (products, orders, sales)?
6. **AI integration** � What AI features are planned? (AI SDK v7 is installed)

---

## Recent Changes

| Date       | Change                                                                                                                                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-31 | Implemented public product list page (`/{shop}/products`): replaced stub with full Server Component, added `ProductFilterBar` (category + brand chip filters with active state), fixed `ProductGrid` pagination `basePath` prop, added `Storefront` i18n namespace to `en.json` and `mm.json` |
| 2026-07-31 | Added a back-to-shop link on the public cart detail page                                                                                                                                                                                                                                      |
| 2026-07-31 | Added a floating public storefront cart button with item count, drawer preview, cart quantity controls, checkout link, and full cart navigation                                                                                                                                               |
| 2026-07-29 | Fixed storefront variant selection so unavailable color/size combinations no longer fall back to aggregate stock and impossible options are disabled                                                                                                                                          |
| 2026-07-29 | Fixed storefront product detail hydration mismatch by making color swatch values resolve deterministically during server and client rendering                                                                                                                                                 |
| 2026-07-29 | Reordered root client providers so `NextIntlClientProvider` wraps dashboard client state providers and preserves `useTranslations` context during client rendering fallback                                                                                                                   |
| 2026-07-28 | Added filtered Excel export to the dashboard product list table                                                                                                                                                                                                                               |
| 2026-07-28 | Fixed production build type error in action test setup by aligning the mock Better Auth user with the installed `User` type                                                                                                                                                                   |
| 2026-07-28 | Fixed ESLint errors in action tests by replacing CommonJS mock imports and explicit `any` types; verified action tests pass                                                                                                                                                                   |
| 2026-07-28 | Fixed public product detail page: updated `ProductDetailData` type, rewrote `getProductDetail` query to use variants with ProductVariantAttributeValue instead of old direct attributeValues, fixed purchase panel to use new type schema                                                     |
| 2026-07-22 | Initial `docs/` folder created with all 6 context files                                                                                                                                                                                                                                       |
| �          | Products, categories, brands, attributes, promotions CRUD implemented                                                                                                                                                                                                                         |
| �          | Subscription schema designed and migrated                                                                                                                                                                                                                                                     |
| �          | Public storefront scaffolded                                                                                                                                                                                                                                                                  |
