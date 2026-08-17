# Progress Tracker � Mini Market Myanmar

_Last updated: 2026-08-12_

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
- [x] Better Auth multi-session browser account switching in settings security tab

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
- [x] Storefront product detail aligned to dashboard `shopCategory` engine routing — specs table for ELECTRONICS/AUTOMOTIVE/HOME_GARDEN/BEAUTY, addon selection UI with price totalling for RESTAURANT, variant selectors only for all others

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

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-13 | Restructured the dashboard product create/edit form into the requested five-step structured payload flow (`basicInfo`, `pricingInventory`, `categoryEngine`, `merchandisingSeo`, review), wired newer product and variant schema fields through validation/create/update/duplicate/edit hydration, and updated focused product action tests.                                                                                                                                                                     |
| 2026-08-13 | Added `docs/project-folder-structure-flow.md` documenting the current repository folder structure, App Router route map, feature-module map, request/data flows, shared runtime boundaries, and observed documentation drift.                                                                                                                                                                                                                                                                                    |
| 2026-08-12 | Added promotion banner image and product-combination targeting support: create/edit forms now manage a Cloudinary banner and multiple product selections, promotion actions persist banner and product relations with shop-scoped product verification, edit hydration is shop-scoped, and the promotions table shows banner thumbnails.                                                                                                                                                                         |
| 2026-08-12 | Fixed the dashboard products table create link so it routes to `/{shop}/dashboard/products/create` instead of resolving relatively to `/{shop}/dashboard/products/products/create` and showing a 404.                                                                                                                                                                                                                                                                                                            |
| 2026-08-11 | Added product form support for product-level cost price, featured flag, notice text, meta title, and meta description, including create/update validation and edit hydration.                                                                                                                                                                                                                                                                                                                                    |
| 2026-08-10 | Updated the shop settings security tab so the active browser session no longer renders switch/revoke actions and inactive session revocation now opens a confirmation dialog before calling Better Auth.                                                                                                                                                                                                                                                                                                         |
| 2026-08-10 | Fixed the dashboard product form wizard so submit events before the final review step only advance the wizard and no longer trigger create/update autosaves before Save & publish.                                                                                                                                                                                                                                                                                                                               |
| 2026-08-10 | Added a general settings `isShowInPublic` control beneath shop logo/banner uploads, persisting public shop visibility through `updateShopAction` with i18n labels and regression coverage.                                                                                                                                                                                                                                                                                                                       |
| 2026-08-10 | Added shop operating hours configuration to the settings advanced tab, including seven-day open/closed time controls, `ShopOperatingHours` upserts in the shop update action, i18n labels, and a regression test for persistence.                                                                                                                                                                                                                                                                                |
| 2026-08-10 | Fixed shop settings contact location persistence by saving `region`, `division`, `township`, and `address` in `updateShopAction`, revalidating the settings route, and adding a regression test for the location fields.                                                                                                                                                                                                                                                                                         |
| 2026-08-10 | Added Better Auth multi-session support with a shop settings security tab for listing browser account sessions, switching the active account, and revoking inactive sessions.                                                                                                                                                                                                                                                                                                                                    |
| 2026-08-10 | Refactored dashboard settings form into separate tab components and changed contact address fields to cascading Myanmar region, division, and township selects backed by `src/constants/myanmar-region-division-township.json`.                                                                                                                                                                                                                                                                                  |
| 2026-08-06 | Aligned storefront product detail UI to dashboard `shopCategory` engine flow: extended `ProductDetailData` type with `specifications` and `addons`; updated `product-detail.query.ts` to select both JSON fields; created `ProductSpecs` (read-only spec table) and `ProductAddons` (interactive restaurant modifier selector with Option B price totalling); rewired `ProductPurchasePanel` to conditionally render by `shopCategory`; updated `ProductDetail` to show full-width spec table below description. |
| 2026-08-06 | Refactored product creation flow into a 3-step wizard with category-specific forms (Base Info, Product Details, Review), added image and YouTube links, implemented atomic transactions for product saves, and fixed Next.js safe action test mocking types.                                                                                                                                                                                                                                                     |
| 2026-07-31 | Implemented public product list page (`/{shop}/products`): replaced stub with full Server Component, added `ProductFilterBar` (category + brand chip filters with active state), fixed `ProductGrid` pagination `basePath` prop, added `Storefront` i18n namespace to `en.json` and `mm.json`                                                                                                                                                                                                                    |
| 2026-07-31 | Added a back-to-shop link on the public cart detail page                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-07-31 | Added a floating public storefront cart button with item count, drawer preview, cart quantity controls, checkout link, and full cart navigation                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-07-29 | Fixed storefront variant selection so unavailable color/size combinations no longer fall back to aggregate stock and impossible options are disabled                                                                                                                                                                                                                                                                                                                                                             |
| 2026-07-29 | Fixed storefront product detail hydration mismatch by making color swatch values resolve deterministically during server and client rendering                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-07-29 | Reordered root client providers so `NextIntlClientProvider` wraps dashboard client state providers and preserves `useTranslations` context during client rendering fallback                                                                                                                                                                                                                                                                                                                                      |
| 2026-07-28 | Added filtered Excel export to the dashboard product list table                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-07-28 | Fixed production build type error in action test setup by aligning the mock Better Auth user with the installed `User` type                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-07-28 | Fixed ESLint errors in action tests by replacing CommonJS mock imports and explicit `any` types; verified action tests pass                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-07-28 | Fixed public product detail page: updated `ProductDetailData` type, rewrote `getProductDetail` query to use variants with ProductVariantAttributeValue instead of old direct attributeValues, fixed purchase panel to use new type schema                                                                                                                                                                                                                                                                        |
| 2026-07-22 | Initial `docs/` folder created with all 6 context files                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| �          | Products, categories, brands, attributes, promotions CRUD implemented                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| �          | Subscription schema designed and migrated                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| �          | Public storefront scaffolded                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
