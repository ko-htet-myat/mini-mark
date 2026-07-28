# Plan: Public Product Detail Page

## Files to Modify

### 1. `src/features/storefront-products/types/index.ts`

- Add: `images: string[]` — derived from product + variant image URLs
- Add: `stock: number` — sum of active variant stocks
- Add: `hasVariants: boolean` — from Product model
- Remove: `sku` (not a product-level field anymore — SKU lives on variants)
- Keep: `rating?` as optional (not modeled yet)

### 2. `src/features/storefront-products/data/product-detail.query.ts`

- Replace `attributeValues` include with `variants` include:
  - `variants.attributeValues.attributeValue.attribute`
- Derive `images` array: `[product.imageUrl, ...variant.imageUrls]` (filter nulls)
- Calculate `stock` as sum of active variant `stock` values
- Group attribute values by attribute across all variants (same grouping logic)
- Fix import style to match other queries (use `import { prisma } from "@/lib/prisma"`)

### 3. `src/features/storefront-products/components/product-detail.tsx`

- No changes needed — it already passes `product.images` and `product.description` correctly once the type/query provide them

### 4. `src/features/storefront-products/components/product-purchase-panel.tsx`

- Replace `product.stock` with derived stock from the type
- Replace `product.sku` rendering — SKU info is on variants, not product-level. Remove the SKU section since there's no single product SKU.
- Remove `product.rating` usage (keep the section, will work once Review model exists)

### 5. `src/features/storefront-products/components/product-gallery.tsx`

- No changes needed — already accepts `images: string[]`

### 6. `src/app/[shop]/products/[productId]/page.tsx`

- No changes needed — already correctly calls `getProductDetail` and renders `ProductDetail`

## No DB Schema Changes

No Prisma migrations required — all fields already exist on the models.

## Data Flow

```
Page Route (Server Component)
  |-- getProductDetail({ shopSlug, productId })
  |     |-- prisma.product.findFirst() with include: { brand, category, variants.attributeValues.attributeValue.attribute }
  |     |-- maps raw Prisma data to ProductDetailData (derives images, stock, attributeGroups)
  |-- returns ProductDetailData to the page
  |-- renders <ProductDetail shopSlug={slug} product={product} />
        |-- <ProductGallery images={...} productName={...} />
        |-- <ProductPurchasePanel shopSlug={...} product={...} onAddToCart={...} onBuyItNow={...} />
```

## Component Breakdown

| Component              | Type   | Responsibility                                                          |
| ---------------------- | ------ | ----------------------------------------------------------------------- |
| `ProductDetail`        | Client | Layout container, passes data to children, holds cart callbacks (stubs) |
| `ProductGallery`       | Client | Thumbnail rail + main image, active index state                         |
| `ProductPurchasePanel` | Client | Breadcrumb, price, attribute selectors, quantity, CTAs                  |
