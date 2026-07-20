# 🛠️ Technical Feature Working (e.g., Brands, Attributes)

This document explains the technical implementation and flow of catalog features (like Brands and Attributes) within the application. The architecture uses a modular approach inside the `src/features` directory.

## 1. Database & Schema (Prisma)

All features are backed by the **Prisma ORM**.

- **Brands:** Mapped to the `Brand` model, which links to a specific `Shop` via `shopId`. It contains fields like `id`, `name`, `slug`, `logoUrl`, and relationships to `Product`.
- **Attributes:** Mapped to the `Attribute` model and linked to multiple `AttributeValue` models. This allows dynamic product variants (e.g., "Color" -> "Red", "Blue").

## 2. Server Actions (Mutations)

Located in `src/features/[feature]/actions/index.ts`.

- **`next-safe-action` Integration:** Mutations (Create, Update, Delete) are securely executed using `shopOwnerActionClient`. This middleware ensures that _only the authenticated owner of the shop_ can modify these resources.
- **Zod Validation:** The incoming data is validated against strict Zod schemas (e.g., `createBrandSchema`, `updateAttributeSchema`).
- **Prisma Transactions:** Complex updates (like updating an attribute and its associated values simultaneously) use Prisma's nested writes to ensure database consistency.
- **Cache Revalidation:** After a successful mutation, `revalidatePath` is called (e.g., `revalidatePath('/[shop]/dashboard/brands')`) to purge Next.js server cache and reflect changes immediately on the dashboard.

## 3. Data Fetching (Queries)

Located in `src/features/[feature]/data/[feature].queries.ts`.

- Queries are executed securely on the server.
- They accept parameters like `shopId`, `page`, `pageSize`, and filters (e.g., `nameFilter`).
- They use `Promise.all` to fetch paginated data and the total count concurrently for optimal performance.

## 4. Validations

Located in `src/features/[feature]/validations/index.ts`.

- Pure Zod schemas define the exact shape of data expected by both the client-side forms and the server-side actions.

## 5. UI Components & Forms

Located in `src/features/[feature]/components`.

- **Forms:** Client-side forms are powered by `react-hook-form` integrated with the Zod schemas via `@hookform/resolvers/zod`.
- **State Management:** When forms are submitted, they invoke the Next.js Server Actions created with `next-safe-action`.
- **Data Tables:** Lists of brands or attributes are rendered using `TanStack Table`, which handles pagination and sorting on the client, feeding parameters back to the server queries.

---

### Step-by-Step Example Flow: Creating a Brand

1. **User Input:** The shop owner fills out the "Create Brand" form (`name`, `slug`).
2. **Client Validation:** `react-hook-form` validates the input against `createBrandSchema`.
3. **Action Execution:** Form submission calls the `createBrand` server action.
4. **Server Middleware:** `shopOwnerActionClient` verifies the user's session and shop ownership.
5. **Database Write:** Prisma executes `prisma.brand.create()`.
6. **Cache Purge:** `revalidatePath` clears the cached brands list.
7. **UI Update:** The user is redirected back to the updated table view.
