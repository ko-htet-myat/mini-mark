# 🚀 Features

A comprehensive overview of all features available in this multi-tenant shop management platform.

---

## 🔐 Authentication & Authorization

Powered by **Better Auth** with secure, type-safe session management.

- **Email & Password Sign-up / Sign-in** — Credential-based authentication with form validation via Zod
- **Social OAuth Sign-in** — OAuth provider support with a dedicated social auth check callback route (`/social-check-auth`)
- **Email Verification** — Verified email flag tracked on the `User` model
- **Session Management** — Persistent sessions with IP address and user agent tracking; cascading deletes on user removal
- **Secure Token Verification** — Time-limited verification tokens stored in the `Verification` model
- **Protected Routes** — Middleware-guarded dashboard routes accessible only to authenticated shop owners

---

## 🏪 Shop Onboarding

Smooth first-run experience for new users.

- **Create Shop Wizard** — Guided onboarding flow at `/(onboarding)/create-shop` to set up a brand-new shop
- **Unique Shop Slug** — Each shop gets a unique, URL-friendly slug used as the dynamic route segment (`/[shop]/...`)
- **One Shop per User** — Enforced at the database level; each owner can have at most one shop

---

## 🛍️ Public Storefront

Customer-facing pages scoped to each shop''s unique slug.

- **Shop Home Page** — Landing page at `/:shop` showcasing the shop
- **Product Listing** — Browse all products at `/:shop/products`
- **Product Detail** — View individual product details at `/:shop/products/:productId`
- **Shopping Cart** — Cart page at `/:shop/cart` for reviewing selected items
- **Order Creation (Checkout)** — Place orders from the cart via `/:shop/cart/create-order`

---

## 📊 Dashboard — Overview

Central hub for shop owners at `/:shop/dashboard`.

- **Dashboard Home** — At-a-glance overview of shop activity and key metrics

---

## 📦 Product Management

Full product lifecycle management inside the dashboard.

- **Product List** — View all products at `dashboard/products`
- **Create Product** — Add new products at `dashboard/products/create`

---

## 🗂️ Catalog Management

Organise products with a rich catalog taxonomy.

- **Categories** — List and create product categories (`dashboard/categories`, `dashboard/categories/create`)
- **Brands** — List and create brands (`dashboard/brands`, `dashboard/brands/create`)
- **Attributes** — List and create product attributes (e.g., size, color) (`dashboard/attributes`, `dashboard/attributes/create`)
- **Promotions** — List and create discount promotions (`dashboard/promotions`, `dashboard/promotions/create`)

---

## 🧾 Orders & Sales

Track and manage all commercial transactions.

- **Orders List** — View all incoming orders at `dashboard/orders`
- **Sales Overview** — Monitor sales performance at `dashboard/sales`
- **Invoices** — Manage invoices and generate per-invoice views (`dashboard/invoices`, `dashboard/theme/invoice`)

---

## 🧮 Calculator

- **Profit / Price Calculator** — Built-in tool at `dashboard/calculator` to compute pricing, margins, or profit

---

## ⚙️ Shop Settings

Manage shop identity and contact details.

- **Shop Profile Settings** — Update shop name, description, logo, banner, contact email, and phone numbers (`dashboard/settings`)
- **Logo & Banner Upload** — Image uploads powered by **Cloudinary** (signed upload params via `/api/sign-cloudinary-params`)

---

## 🎨 Theme Customisation

- **Theme Selector** — Choose and preview shop themes at `dashboard/theme`
- **Dark / Light Mode** — App-wide theme toggle powered by **next-themes**

---

## 🌍 Internationalisation (i18n)

- **Multi-language Support** — Translations managed via **next-intl** with message files in `/messages`
- **Locale-aware Routing** — Locale prefix handled transparently by the framework

---

## 🧰 Developer & Infrastructure

- **Type-safe Server Actions** — All mutations use **next-safe-action** with Zod validation and Better Auth middleware adapter
- **Database** — **PostgreSQL** with **Prisma ORM** (Prisma Client v7, pg adapter) and a seed script
- **State Management** — Client-side global state via **Zustand**
- **Server State / Caching** — Data fetching and caching with **TanStack Query (React Query v5)**
- **Data Tables** — Feature-rich tables powered by **TanStack Table**
- **Forms** — Validated forms using **React Hook Form** + `@hookform/resolvers` + **Zod v4**
- **UI Components** — **shadcn/ui** (Radix UI primitives) + **TailwindCSS v4** + CVA for variant management
- **Icons** — **HugeIcons** icon library
- **Notifications** — Toast notifications via **Sonner**
- **AI Integration** — **Vercel AI SDK v7** (`ai` package) integrated for AI-powered features
- **Image Hosting** — **Cloudinary** via `next-cloudinary`
- **Testing** — Unit & integration tests with **Vitest** + **React Testing Library** + **jsdom**
- **Code Quality** — ESLint + Prettier with **Husky** pre-commit hooks via **lint-staged**
- **Monorepo Ready** — `pnpm-workspace.yaml` configured for workspace-based package management

---

## 🗺️ Route Map

```
/                                   → Root redirect
/(auth)/sign-in                     → Sign-in page
/(auth)/sign-up                     → Sign-up page
/(auth)/social-check-auth           → OAuth callback handler
/(onboarding)/create-shop           → New shop setup wizard
/api/auth/[...]                     → Better Auth API handler
/api/sign-cloudinary-params         → Signed Cloudinary upload

/:shop                              → Public shop home
/:shop/products                     → Public product listing
/:shop/products/:productId          → Product detail
/:shop/cart                         → Shopping cart
/:shop/cart/create-order            → Checkout / create order

/:shop/dashboard                    → Dashboard overview
/:shop/dashboard/products           → Product management list
/:shop/dashboard/products/create    → Create product
/:shop/dashboard/categories         → Category list
/:shop/dashboard/categories/create  → Create category
/:shop/dashboard/brands             → Brand list
/:shop/dashboard/brands/create      → Create brand
/:shop/dashboard/attributes         → Attribute list
/:shop/dashboard/attributes/create  → Create attribute
/:shop/dashboard/promotions         → Promotion list
/:shop/dashboard/promotions/create  → Create promotion
/:shop/dashboard/orders             → Orders list
/:shop/dashboard/sales              → Sales overview
/:shop/dashboard/invoices           → Invoice list
/:shop/dashboard/calculator         → Profit/price calculator
/:shop/dashboard/settings           → Shop settings
/:shop/dashboard/theme              → Theme selector
/:shop/dashboard/theme/invoice      → Invoice theme preview
```
