# Public Cart Drawer Plan

## Files To Modify

- `src/app/[shop]/layout.tsx`
  - Render the floating public cart component for shop routes.
- `src/features/storefront-products/components/product-detail.tsx`
  - Pass cart handlers to the purchase panel if needed.
- `src/features/storefront-products/components/product-purchase-panel.tsx`
  - Connect Add to cart and Buy it now to the cart store.
- `src/features/cart/components/cart-list.tsx`
  - Reuse or align full cart rendering with translated cart labels.
- `messages/en.json`
  - Add cart translation keys.
- `messages/mm.json`
  - Add matching cart translation keys.
- `docs/progress-tracker.md`
  - Record the implementation once complete.

## Files To Create

- `src/features/cart/components/floating-cart-button.tsx`
  - Client component for the fixed cart button and drawer.

## DB Schema Changes

None.

## Component Breakdown

- `FloatingCartButton`
  - Reads shop slug from props.
  - Uses `useCart(shopSlug)` for hydration-safe item count, subtotal, quantity updates, and removals.
  - Uses `Sheet` for the drawer UI.
  - Shows item previews, quantity controls, subtotal, checkout link, full cart link, and empty state.

- `ProductPurchasePanel`
  - Builds the existing selected product/variant payload into a `CartItem`.
  - Calls `addItem(shopSlug, item)` for Add to cart.
  - Calls `addItem(shopSlug, item)` then routes to `/{shop}/cart/create-order` for Buy it now.

## Data Flow

1. Product detail page passes product data to `ProductPurchasePanel`.
2. Customer selects variant and quantity.
3. `ProductPurchasePanel` writes a `CartItem` snapshot into the persisted Zustand cart store.
4. `FloatingCartButton` subscribes to the same store and updates item count/drawer contents after hydration.
5. Drawer controls update or remove cart lines through the cart hook.

## Verification

- Run targeted tests if added.
- Run `pnpm lint`.
- Run `pnpm test` if cart logic tests are added or existing cart-related utilities are touched.
