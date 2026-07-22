# Project Overview � Mini Market Myanmar

## Product Definition

**Mini Market Myanmar** is a multi-tenant SaaS platform that lets individual shop owners in Myanmar launch, manage, and grow their own online storefronts under a shared marketplace umbrella. Each shop owner gets an isolated dashboard at `/{shop-slug}/dashboard` where they can manage their catalogue, promotions, and subscription plan.

---

## Goals

| Goal                 | Description                                                                             |
| -------------------- | --------------------------------------------------------------------------------------- |
| Shop self-service    | Allow any user to sign up, create a shop, and start selling without technical knowledge |
| Catalogue management | Full CRUD for products, categories, brands, attributes, and promotions                  |
| Subscription model   | Gate features behind tiered subscription plans managed manually by admins               |
| Localisation         | Full bilingual support (English + Myanmar/Burmese) via `next-intl`                      |
| Public storefront    | Each shop has a public-facing page customers can browse                                 |

---

## Target Users

- **Shop Owners** � register, onboard, manage products and promotions through their dashboard
- **Customers** � browse public shop pages, view products
- **Admins** � review subscription requests, approve/reject upgrades, record payments

---

## Features

### Authentication

- Email + password sign-up with email verification
- Google OAuth (account linking enabled)
- Disposable email domain blocking
- Rate limiting (5 requests / 60 s window)
- Session cookie caching (5-minute TTL)

### Shop Onboarding

- First-time users are redirected to `/onboarding/create-shop`
- Shop has: slug, name, description, logo, banner, contact email, contact phones
- One shop per user (enforced by unique `ownerId` constraint)

### Dashboard (`/{shop}/dashboard`)

- **Products** � create, edit, delete, toggle active status; supports category, brand, attribute-value associations, compare-at price, YouTube embed, image gallery (Cloudinary)
- **Categories** � hierarchical (parent  children), with image and slug, promotable
- **Brands** � with logo, slug, promotable
- **Attributes** � custom key-value attributes assignable to products with optional extra price
- **Promotions** � percentage or fixed-amount discounts, optional promo codes, date-ranged, applicable to products/categories/brands or shop-wide
- **Orders / Sales / Invoices / Calculator** � route stubs present, implementation ongoing
- **Settings** � shop profile settings
- **Theme** � per-shop appearance customisation (route present)

### Subscription System

- Plans: Starter, Growth, Pro (monthly / yearly billing intervals)
- Shop owner submits a `SubscriptionRequest` (with contact phone/message)
- Admin reviews request  Approved / Rejected
- On approval: admin manually records a `PaymentRecord` and activates a `Subscription`
- Payment methods: Bank Transfer, Cash, Mobile Money, Other
- Statuses: Trialing  Active, Expired, Canceled, Pending Activation

### Public Storefront (`/{shop}`)

- Home page with product listing
- Product detail page (`/{shop}/products/{productId}`)
- Cart page (route stub present)

### Internationalisation

- Locales: `en` (English), `mm` (Myanmar)
- Locale detection via `next-intl` request config
- Language switcher component available in the UI

---

## Out of Scope (Current Phase)

- Payment gateway integration (Stripe, etc.) � payments are recorded manually
- Real-time order tracking
- Customer accounts / reviews
- Admin dashboard UI (admin actions happen via API / direct DB)

---

## Key Constraints

- One shop per user account
- Subscription is managed manually � no automated billing
- Images are hosted on Cloudinary; no local storage
- Myanmar font (`Noto Sans Myanmar`) is served via Google Fonts and activated with `lang="mm"` on `<html>`
