# Spec: Public Product List Page (`/{shop}/products`)

## What

Implement the public-facing product list page at `/{shop}/products`. This page is currently a placeholder stub. Customers should be able to browse all active products for a shop, filter by category and brand, and navigate pagination — all from a dedicated page (separate from the shop home page).

## Why

- `CategoryList` and `BrandList` on the shop home page already link to `/{shopSlug}/products?category=...` and `/{shopSlug}/products?brand=...` — these links currently land on a blank stub.
- The architecture doc lists `/{shop}/products/` as the product listing route.
- Customers need a full browsable catalogue view separate from the shop landing page.

## Acceptance Criteria

- [ ] `/{shop}/products` renders a list of all active products for the shop
- [ ] Filtering by `?category=<slug>` shows only products in that category
- [ ] Filtering by `?brand=<slug>` shows only products in that brand
- [ ] Filtering by `?name=<string>` (search) narrows products by name
- [ ] Pagination via `?page=<n>` works correctly
- [ ] Each product card links to `/{shop}/products/{productId}`
- [ ] Category filter pills shown at top — clicking one sets `?category=` param
- [ ] Brand filter shown — clicking one sets `?brand=` param
- [ ] Active filters are highlighted/visually distinguished
- [ ] A "clear filters" / "All" option resets active filter
- [ ] Empty state shown when no products match
- [ ] Page has correct `<title>` / metadata (shop name + "Products")
- [ ] Page is a Server Component (no unnecessary `"use client"`)
- [ ] i18n: all user-facing strings use `next-intl`

## Out of Scope

- Price-range filter (not in data model at this level)
- Sorting controls (out of scope for this phase)
- Search input box (name filter via URL param is sufficient for now; a search UI can come later)

## Open Questions

_None — implementation can proceed._
