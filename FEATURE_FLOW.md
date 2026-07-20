# 🌊 Feature Flow

This document outlines the primary user journeys and feature flows in the multi-tenant shop management platform.

---

## 1. Authentication & Onboarding Flow

**Goal:** Allow users to sign up, verify identity, and create their first shop.

1. **User Landing** → User arrives at the root (`/`) or directly navigates to sign-up/sign-in.
2. **Authentication** (`/(auth)/sign-in` or `/(auth)/sign-up`):
   - User signs up via Email/Password or OAuth (Social Check Auth).
   - _System:_ Creates User and Session using Better Auth.
3. **Onboarding** (`/(onboarding)/create-shop`):
   - If a new user does not have a shop, they are guided to the shop creation wizard.
   - User inputs shop details (name, slug).
   - _System:_ Ensures unique slug and one-shop-per-user constraint.
4. **Completion:** User is redirected to their new shop's dashboard.

---

## 2. Shop Owner Flow (Dashboard Management)

**Goal:** Empower shop owners to manage their catalog, monitor sales, and configure shop settings.

1. **Dashboard Access** (`/:shop/dashboard`):
   - Owner views at-a-glance metrics, recent orders, and sales overview.
2. **Catalog & Product Management**:
   - **Categories/Brands/Attributes** (`/:shop/dashboard/categories`, etc.): Owner sets up taxonomy.
   - **Products** (`/:shop/dashboard/products`): Owner views, edits, or adds new products (`/:shop/dashboard/products/create`).
3. **Sales & Orders Management**:
   - **Orders** (`/:shop/dashboard/orders`): Owner tracks incoming customer orders and updates statuses.
   - **Invoices** (`/:shop/dashboard/invoices`): Owner manages and previews invoices (`/:shop/dashboard/theme/invoice`).
   - **Promotions** (`/:shop/dashboard/promotions`): Owner creates discount codes.
4. **Shop Configuration**:
   - **Settings** (`/:shop/dashboard/settings`): Owner updates logos, banners (Cloudinary), and contact info.
   - **Theme** (`/:shop/dashboard/theme`): Owner customizes the visual appearance of their storefront.
5. **Utilities**:
   - **Calculator** (`/:shop/dashboard/calculator`): Owner calculates profit margins and pricing.

---

## 3. Customer Flow (Public Storefront)

**Goal:** Allow customers to browse products, add them to a cart, and complete purchases.

1. **Store Discovery** (`/:shop`):
   - Customer arrives at the shop's unique public landing page.
   - They see the shop's custom theme and banner.
2. **Product Browsing** (`/:shop/products`):
   - Customer views the full catalog.
   - Customer clicks a product for details (`/:shop/products/:productId`).
3. **Cart Management** (`/:shop/cart`):
   - Customer adds items to the cart.
   - Customer reviews cart items, quantities, and totals.
4. **Checkout & Order Creation** (`/:shop/cart/create-order`):
   - Customer proceeds to checkout.
   - _System:_ Creates an order in the database linked to the shop.
   - Customer receives order confirmation.

---

## System Integrations Flow

- **Database:** Prisma ORM with PostgreSQL.
- **State:** Zustand for client global state, React Query (TanStack) for server state/caching.
- **Forms & Validation:** React Hook Form + Zod + next-safe-action for type-safe backend mutations.
- **UI:** shadcn/ui components styling the flows, localized via next-intl.
