# Product Creation Flow

How products are created across shop categories, and how the code is organized in `src/features/products/`.

---

## 1. Core Idea: Category-Driven Engine

Every product shares one **universal base schema** (name, slug, price, category, brand, media). What happens _beyond_ that base depends on the owning shop's `shopCategory`:

| Data                                     | Used by                                                                                                                              | Storage                                                                 |
| :--------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `Product.specifications` (Json)          | `ELECTRONICS`, `AUTOMOTIVE`                                                                                                          | arbitrary key-value specs (RAM, Warranty, Voltage)                      |
| `Product.addons` (Json)                  | `RESTAURANT`                                                                                                                         | modifier/option groups (toppings, spice level) — bypasses SKUs entirely |
| `Product.hasVariants` + `ProductVariant` | `FASHION`, `SPORTS`, `GROCERY`, `LIQUOR_STORE`, `HEALTH`, `HOME_GARDEN`, `BEAUTY`, `SERVICES`, `BOOKS_STATIONERY`, `OTHER`, `RETAIL` | relational SKU matrix via `ProductVariantAttributeValue`                |

`HOME_GARDEN` and `BEAUTY` use **both** specs and the variant matrix (e.g. color/scent variants _and_ dimensions/ingredients metadata).

Regardless of category, **every product ends up with at least one `ProductVariant`**. If `hasVariants` is false (or the shop is `RESTAURANT`), the server creates a single default variant so price/stock/status always live in one place — this keeps checkout (`OrderItem.variantId`) uniform across categories.

---

## 2. Category → Engine Mapping

| `ShopCategoryType`                                | Engine                    | UI                                                     |
| :------------------------------------------------ | :------------------------ | :----------------------------------------------------- |
| `FASHION`, `SPORTS`                               | Variant Matrix            | Multi-attribute Cartesian generator (Color × Size)     |
| `ELECTRONICS`, `AUTOMOTIVE`                       | Specs + Variant Matrix    | Key-value spec fields + optional single-dim matrix     |
| `GROCERY`, `LIQUOR_STORE`, `HEALTH`               | Variant Matrix            | Single-dimension packaging (250g, 1kg, Pack of 6)      |
| `RESTAURANT`                                      | Add-ons                   | Option groups with min/max select and per-option price |
| `HOME_GARDEN`, `BEAUTY`                           | Specs + Variant Matrix    | Color/scent variants + ingredient/dimension metadata   |
| `SERVICES`, `BOOKS_STATIONERY`, `RETAIL`, `OTHER` | Variant Matrix (optional) | Flat rate, or simple tiers if variants enabled         |

---

## 3. The 3-Step Wizard

```
┌────────────────────────────────────────────────────────┐
│  STEP 1 — Universal Base Info                          │
│  Name, Slug, Description, Base Price, Category, Brand, │
│  Image, YouTube URL                                     │
└──────────────────────────┬──────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│  STEP 2 — Category Engine (EngineRouter)                │
│  ├─ RESTAURANT ─────► AddonsEngine                      │
│  ├─ ELECTRONICS/AUTOMOTIVE ─► SpecsEngine + Matrix       │
│  ├─ HOME_GARDEN/BEAUTY ─────► Matrix + SpecsEngine       │
│  └─ everything else ────────► VariantMatrixEngine        │
└──────────────────────────┬──────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│  STEP 3 — Review & Save                                 │
│  Atomic Prisma transaction: Product → ProductVariant(s)  │
│  → ProductVariantAttributeValue junction rows            │
└────────────────────────────────────────────────────────┘
```

---

## 4. File Structure

```
src/features/products/
├── actions/
│   └── index.ts              # createProduct, updateProduct, deleteProduct
├── data/
│   └── products.queries.ts   # getProducts, getProductById, getShopAttributes
├── validations/
│   └── index.ts              # base + category-conditional Zod schemas
├── utils/
│   └── cartesian.ts          # generateVariantMatrix()
├── hooks/
│   └── use-product-form.ts   # react-hook-form + zodResolver + useAction
└── components/
    ├── product-form-wizard.tsx
    ├── variant-matrix-table.tsx     # TanStack Table, editable SKU rows
    └── steps/
        ├── base-info-step.tsx
        ├── engine-router.tsx        # picks engine by shopCategory
        ├── specs-engine.tsx         # ELECTRONICS/AUTOMOTIVE
        ├── addons-engine.tsx        # RESTAURANT
        └── variant-matrix-engine.tsx # FASHION/SPORTS/GROCERY/etc.
```

---

## 5. Request Lifecycle: Creating a Product

1. **Client** — `ProductFormWizard` renders `BaseInfoStep` + `EngineRouter` inside a single `react-hook-form` context (`createProductSchema` via `zodResolver`).
2. **Validation (client)** — Zod validates on submit; category-conditional fields (`specifications` / `addons` / `variants`) are all part of one schema so the whole payload is type-safe.
3. **Server Action** — `createProduct` (wrapped in `shopOwnerActionClient`) receives the parsed input. `ctx.shop` — already authorized — supplies `shopId` and `shopCategory`; these are **never trusted from the client payload**.
4. **Category enforcement (server)** — the action re-derives category rules server-side:
   - `RESTAURANT` → `hasVariants` forced to `false`, `addons` persisted, one default variant created.
   - Any category with `hasVariants: true` and a populated `variants[]` → each variant + its `ProductVariantAttributeValue` links are created in the transaction.
   - Everything else → one default `ProductVariant` is created so price/stock always resolve consistently.
5. **Atomic write** — all of the above happens inside a single `prisma.$transaction` (`Product` → `ProductVariant`(s) → junction rows), so a partial failure never leaves an orphaned product.
6. **Cache purge** — `revalidatePath('/[shop]/dashboard/products')` clears the cached list.
7. **Client feedback** — `useAction`'s `onSuccess` toasts via **sonner**, invalidates the `["products", shopId]` React Query key, and redirects to the products table.

---

## 6. Variant Matrix Generation

`generateVariantMatrix(skuPrefix, basePrice, attributes)` computes the Cartesian product of selected attribute values (e.g. Color × Size) and returns one row per combination:

```
Color: [Red, Blue]  ×  Size: [S, M]
  → Red / S   → SKU-RED-S
  → Red / M   → SKU-RED-M
  → Blue / S  → SKU-BLUE-S
  → Blue / M  → SKU-BLUE-M
```

Generated rows populate `form.variants[]`, which the user then edits per-row (SKU, price, stock) in `VariantMatrixTable` before submitting.

---

## 7. Update & Delete

- **`updateProduct`** — re-verifies the product belongs to `ctx.shop` before writing, then **replaces the variant set wholesale** (delete all → recreate) inside the transaction. This is the simplest correct strategy; `OrderItem` already snapshots `productName` / `sku` / `price` at order time, so past orders are unaffected even if variant ids change.
- **`deleteProduct`** — ownership-checked, then `prisma.product.delete()`. Cascades remove `ProductVariant` and `ProductVariantAttributeValue` rows (`onDelete: Cascade` in schema); `OrderItem.productId`/`variantId` are set to `null` (`onDelete: SetNull`) so historical orders survive.

---

## 8. Security Notes

- `shopId` and `shopCategory` always come from the authenticated `ctx.shop`, never from client input — prevents a caller from creating products under a shop they don't own or spoofing category-gated fields (e.g. sending `addons` for a non-`RESTAURANT` shop).
- Update/delete actions re-check `product.shopId === ctx.shop.id` before mutating, even though the action client already scopes to the owner's shop — defense against stale/forged product ids.
