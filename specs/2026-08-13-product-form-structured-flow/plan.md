# Product Form Structured Flow Plan

## Files To Modify

- `src/features/dashboard-products/validations/index.ts`
  - Replace the flat create/update schema with structured nested objects.
  - Add `UnitOfMeasure` validation.
  - Add product inventory fields, merchandising flags, and expanded variant fields.
  - Keep compatibility types exported for action and form usage.

- `src/features/dashboard-products/actions/index.ts`
  - Map structured form input into the flat Prisma `Product` and nested `ProductVariant` writes.
  - Persist `uom`, `barcode`, `minOrderQuantity`, `maxOrderQuantity`, `isOutOfStock`, `isSpecialMenu`, `isBestSellerItem`, `isCollection`, and expanded variant fields.
  - Continue creating a default variant for simple products and restaurants.
  - Preserve shop ownership checks, transactions, revalidation, and user-friendly Prisma errors.

- `src/features/dashboard-products/data/product.queries.ts`
  - Select and serialize the newer product and variant fields for product lists and edit hydration.

- `src/app/[shop]/dashboard/products/[productId]/edit/page.tsx`
  - Hydrate the nested `initialData` shape from the existing product record.

- `src/features/dashboard-products/components/forms/product-form-wizard.tsx`
  - Expand wizard steps from three to five.
  - Update default values to nested form data.
  - Update step validation and review rendering.

- `src/features/dashboard-products/components/steps/base-info-step.tsx`
  - Limit to `basicInfo` fields.
  - Keep image upload and category/brand selectors.

- New or modified step components under `src/features/dashboard-products/components/steps/`
  - Add `pricing-inventory-step.tsx`.
  - Add `merchandising-seo-step.tsx`.
  - Update `engine-router.tsx`, `variant-matrix-engine.tsx`, `specs-engine.tsx`, and `addons-engine.tsx` to use nested `categoryEngine` paths.

- `src/features/dashboard-products/components/tables/variant-matrix-table.tsx`
  - Read/write nested variant paths.
  - Add columns/controls for expanded variant fields.

- `src/features/dashboard-products/utils/cartesian.ts`
  - Align generated variants with the new `attributeValueIds` structure and nested variant input type.

- `src/tests/actions/products.test.ts`
  - Update action tests to submit nested payloads.
  - Add coverage for product inventory fields, category flags, variant cost/uom/backorder/uomValue, and duplicate behavior.

- `docs/progress-tracker.md`
  - Update after implementation lands.

## DB Schema Changes

No database schema changes are planned. The requested fields already exist in `prisma/schema.prisma`.

## Component Breakdown

- `ProductFormWizard`
  - Owns the step index, safe-action hook, top-level form provider, and final submit.
  - Uses nested form values as the source of truth.

- `BaseInfoStep`
  - `basicInfo.name`, `basicInfo.slug`, `basicInfo.description`, `basicInfo.categoryId`, `basicInfo.brandId`, `basicInfo.imageUrl`, `basicInfo.youtubeUrl`.

- `PricingInventoryStep`
  - `pricingInventory.price`, `compareAtPrice`, `costPrice`, `uom`, `barcode`, `minOrderQuantity`, `maxOrderQuantity`, `isOutOfStock`.

- `EngineRouter`
  - Routes by shop category and updates `categoryEngine`.
  - Keeps selected attributes in `categoryEngine.selectedAttributeIds` for UI only.

- `VariantMatrixEngine` and `VariantMatrixTable`
  - Generates variants from selected attributes.
  - Stores each variant with `attributeValueIds`.

- `SpecsEngine`
  - Stores key-value entries in `categoryEngine.specifications`.

- `AddonsEngine`
  - Stores restaurant add-on groups in `categoryEngine.addons`.

- `MerchandisingSeoStep`
  - Category-gated toggles and SEO/notice fields under `merchandisingSeo`.

- `ReviewStep`
  - Renders grouped read-only sections for the four structured objects.

## Data Flow

1. Server page loads shop-scoped categories, brands, attributes, and optionally the product being edited.
2. Server page passes serializable props into the client `ProductFormWizard`.
3. Wizard initializes React Hook Form with the nested default values.
4. Intermediate steps validate only their relevant nested fields before advancing.
5. Final review calls the safe action once.
6. Server action validates the nested payload, maps it to Prisma writes, and revalidates dashboard product paths.

## Risk Notes

- This is a broad form contract change. Action tests should be updated before marking implementation tasks complete.
- Existing code may still expect the flat `CreateProductInput` shape. Any references found during implementation must be migrated together.
- The variant UI table can become horizontally dense after adding fields; use stable widths and responsive overflow to avoid layout breakage.
