# Promotion Banner and Product Selection

## What

Add promotion form support for:

- A banner image stored on `Promotion.bannerImage`.
- Selecting multiple products that the promotion applies to, using the existing `Promotion.products` relation.

This completes the existing promotion data model so shop owners can visually brand promotions and target a combination of products from the create/edit promotion screens.

## Acceptance Criteria

- Shop owners can upload or clear a promotion banner image in the create promotion form.
- Shop owners can upload, replace, or clear a promotion banner image in the edit promotion form.
- Shop owners can select zero or more products in the create promotion form.
- Shop owners can see and update the currently selected products in the edit promotion form.
- The dashboard promotions table shows the promotion banner image when one exists.
- Saving a promotion persists `bannerImage` and the selected product relation.
- Selecting no products continues to mean the promotion is not product-targeted by product relation.
- Product options are scoped to the current shop only.
- Existing promotion create/update behavior for slug, promo code, discount type/value, active status, and descriptions keeps working.
- Associated promotion action tests cover banner image persistence and product connect/set behavior.

## Out of Scope

- New database tables or schema fields.
- Category and brand targeting UI.
- Storefront promotional banner display.
- Promotion usage or checkout discount calculation changes.
- Product variant-level promotion targeting.
- Category and brand targeting changes; this spec only exposes product targeting.

## Open Questions

- None.
