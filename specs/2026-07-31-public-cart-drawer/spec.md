# Public Cart Drawer

## What

Add a floating cart control to public shop pages so customers can always see their cart item count, open a drawer with cart contents, and continue to checkout or the full cart page.

The feature completes the localStorage-backed public cart path that already exists in `src/store/cart-store.ts`, `src/features/cart/`, and `/{shop}/cart`.

## Why

Customers currently need a visible cart entry point after adding products. A persistent floating control makes the cart discoverable while browsing products and gives quick access to checkout decisions without leaving the storefront.

## Acceptance Criteria

- Public storefront pages under `/{shop}` show a fixed floating cart button outside dashboard routes.
- The cart button displays the current cart item count for the active shop.
- Clicking the cart button opens a drawer/sheet with current cart items, quantities, line totals, subtotal, and empty state.
- Drawer item quantity controls update the persisted cart and clamp to stock limits.
- Drawer item remove controls update the persisted cart.
- Drawer actions include a checkout action and a link to the full `/{shop}/cart` detail page.
- Existing product detail "Add to cart" adds the selected product/variant/quantity to the cart.
- Existing product detail "Buy it now" adds the selected product/variant/quantity to the cart and sends the customer toward checkout.
- User-facing strings are translated in both `messages/en.json` and `messages/mm.json`.
- The implementation uses existing shadcn/ui primitives and project styling conventions.

## Out Of Scope

- Database-backed carts.
- Customer accounts.
- Payment gateway integration.
- Creating a real order record.
- Coupon code implementation.
- Cross-device cart synchronization.

## Open Questions

- Checkout destination is currently a stub at `/{shop}/cart/create-order`; this spec assumes the drawer checkout button should link there.
- Cart persistence remains single-shop localStorage, matching the current cart store.
