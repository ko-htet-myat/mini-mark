# Product Form Structured Flow Spec

## What

Restructure the dashboard product create/edit wizard to match the product payload shape requested on 2026-08-13:

1. `basicInfo`
2. `pricingInventory`
3. `categoryEngine`
4. `merchandisingSeo`
5. read-only review

The Prisma schema already contains the newer product fields (`uom`, `barcode`, order quantity limits, manual out-of-stock flag, category flags, variant cost/uom/backorder/uomValue). This work makes the dashboard form, validation, edit hydration, and create/update/duplicate actions use those fields consistently.

## Why

The current product wizard is still organized around a flat three-step form. Basic product details, pricing, SEO, merchandising, and stock controls are mixed together, while several existing schema fields are not exposed or persisted through the form. The structured flow gives shop owners a clearer product creation path and aligns the UI payload with the domain model.

## Acceptance Criteria

- Product create/edit displays five steps: Basic info, Pricing & inventory, Category engine, Merchandising & SEO, and Review.
- The form state is organized around the requested object shape: `basicInfo`, `pricingInventory`, `categoryEngine`, and `merchandisingSeo`.
- Basic info captures name, slug, description, category, brand, image URL, and YouTube URL.
- Pricing & inventory captures price, compare-at price, cost price, unit of measure, barcode, minimum order quantity, maximum order quantity, and manual out-of-stock status.
- Category engine routes by `shopCategory`:
  - Variant matrix for `FASHION`, `SPORTS`, `GROCERY`, `LIQUOR_STORE`, `HEALTH`, `HOME_GARDEN`, and `BEAUTY`.
  - Specifications for `ELECTRONICS` and `AUTOMOTIVE`, and also available for `HOME_GARDEN` and `BEAUTY`.
  - Add-ons for `RESTAURANT`.
- Variant rows support SKU, price, compare-at price, cost price, stock, image URL, allow backorder, optional unit override, optional unit value, and attribute value IDs.
- The category engine keeps `selectedAttributeIds` as UI-only state and does not persist it directly.
- Merchandising & SEO captures featured status, category-specific flags, notice text, meta title, and meta description.
- Category-specific merchandising visibility follows the requested rules:
  - `isBestSellerItem`: `FASHION`, `BOOKS_STATIONERY`, `ELECTRONICS`, `BEAUTY`
  - `isCollection`: `FASHION`
  - `isSpecialMenu`: `RESTAURANT`
- Create and update server actions persist all supported fields atomically and continue to enforce shop ownership.
- Edit pages hydrate all fields from the database into the structured form shape.
- Duplicate product preserves the newer product and variant fields where applicable, with copied products inactive by default.
- Review step renders the four structured objects read-only and submits only on confirmation.
- Tests cover validation and create/update/duplicate persistence for the new fields.
- `pnpm test` or the focused associated tests pass before implementation tasks are marked complete.

## Out Of Scope

- Database schema changes or new migrations.
- Public storefront redesign.
- Order, checkout, stock movement, or inventory adjustment workflows beyond persisting product and variant fields.
- Live preview, draft autosave, or partial step persistence.
- Translation cleanup beyond any strings touched by this product form change.

## Open Questions

- Should `RETAIL`, `BOOKS_STATIONERY`, `SERVICES`, and `OTHER` keep the current fallback variant engine, or should they use a simple non-variant product path by default?
- Should `compareAtPrice` be validated to be greater than `price`, or can it remain any positive optional number as it is today?
- Should `maxOrderQuantity` be required to be greater than or equal to `minOrderQuantity` when both are set?
- Should barcode uniqueness conflicts show a distinct message from slug uniqueness conflicts?
