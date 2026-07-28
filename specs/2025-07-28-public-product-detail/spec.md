# Spec: Public Product Detail Page

## What & Why

The public storefront at `/{shop}/products/{productId}` should display a full product detail page with gallery, pricing, variant selection (color/size/attributes), add-to-cart/buy-it-now actions, description, and breadcrumb navigation.

The route exists (`src/app/[shop]/products/[productId]/page.tsx`) and component stubs exist in `src/features/storefront-products/`, but they were written against an older schema (used `attributeValues` directly on Product) and the `ProductDetailData` type is missing several fields required by the components. The implementation is broken.

## Acceptance Criteria

1. `GET /{shop}/products/{productId}` renders a 200 page showing the active product
2. A nonexistent product ID or inactive product returns 404
3. Page has breadcrumb: Shop > Category (if any) > Product name
4. Product gallery shows the product image plus variant images as thumbnails
5. Price shows as formatted currency; compare-at price renders with strikethrough if present
6. Attribute groups (Color swatches, Size pills, etc.) are rendered from variant data
7. "Buy it now" and "Add to cart" buttons are present (callbacks wired to console.log stubs)
8. Out-of-stock state disables CTAs and shows "Out of stock"
9. Product description is rendered below the fold
10. `generateMetadata` returns proper OG tags

## Out of Scope

- Actual cart/order integration (cart store, server actions) — callbacks remain console.log stubs
- Review/rating display (no Review model exists yet)
- YouTube embed rendering (field exists on Product but not rendered)
- Multi-image upload UI (only product.imageUrl + variant imageUrls are used)
- i18n translations (hardcoded English strings are acceptable for now)

## Open Questions

- Should images be derived as [product.imageUrl, ...variantImageUrls] or is there a separate gallery model? **Decision:** Derive from product + variants, since there is no separate ProductImage model in the schema.
- Should the attribute groups be computed from variants or stored separately? **Decision:** Computed from `ProductVariantAttributeValue` -> `AttributeValue` -> `Attribute`.
