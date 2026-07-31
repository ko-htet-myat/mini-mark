# Plan: Public Product List Page (`/{shop}/products`)

## Files Changed

| Action | File                                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| MODIFY | `messages/en.json` — added `Storefront` i18n namespace                                 |
| MODIFY | `messages/mm.json` — added `Storefront` i18n namespace (Myanmar)                       |
| NEW    | `src/features/storefront-products/components/product-filter-bar.tsx`                   |
| MODIFY | `src/features/storefront-products/components/product-grid.tsx` — added `basePath` prop |
| MODIFY | `src/app/[shop]/products/page.tsx` — replaced stub with full implementation            |

## Component Breakdown

### `ProductFilterBar` (new Server Component)

- Accepts: `shopSlug`, `categories`, `brands`, `activeCategory`, `activeBrand`
- Renders category chip row + brand chip row
- Each chip is a `<Link>` that sets or clears the relevant query param while preserving the other
- Active chip is highlighted with `bg-primary text-primary-foreground`
- "Clear filters" link appears when any filter is active
- Uses `getTranslations("Storefront")` from `next-intl/server`

### `ProductGrid` (modified)

- Added optional `basePath?: string` prop
- Defaults to `/{shopSlug}#products` (preserves shop home page behaviour)
- Callers on the `/products` page pass `/{shop}/products` so pagination is correct

### `[shop]/products/page.tsx` (replaced stub)

- Async Server Component
- Reads `params.shop`, `searchParams.category`, `searchParams.brand`, `searchParams.page`
- Fetches shop, categories, brands, products in parallel via `Promise.all`
- Renders: breadcrumb → `<h1>` → `ProductFilterBar` → `ProductGrid`
- `generateMetadata` returns `{title: "{Shop Name} — Products"}`

## Data Flow

```
URL: /{shop}/products?category=shoes&brand=nike&page=2
         ↓
  page.tsx (Server Component)
  ├── getShopBySlug(slug)           → shop
  ├── getShopCategories(shop.id)    → categories[]
  ├── getShopBrands(shop.id)        → brands[]
  └── getShopProducts({ shopId, page, categorySlug, brandSlug })
                                    → { products[], page, totalPages }
         ↓
  ProductFilterBar (renders chip filters as Links)
  ProductGrid (renders product cards + pagination Links)
```

## No DB Changes Required

All data is fetched using existing Prisma query helpers.
