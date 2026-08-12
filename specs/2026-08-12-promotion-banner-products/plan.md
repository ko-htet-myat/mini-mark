# Implementation Plan

## Files to Modify

- `src/features/dashboard-promotions/validations/index.ts`
  - Add optional `bannerImage` and `productIds` fields to promotion form validation.
- `src/features/dashboard-promotions/actions/index.ts`
  - Persist `bannerImage`.
  - Connect selected products on create.
  - Replace selected products on update.
  - Verify selected products belong to the current shop before writing relations.
- `src/features/dashboard-promotions/data/promotion.queries.ts`
  - Include selected products for edit hydration.
  - Add a shop-scoped product option query for promotion forms.
  - Keep promotion table data compatible with the banner column.
- `src/app/[shop]/dashboard/promotions/create/page.tsx`
  - Fetch product options on the server and pass them into the create form.
- `src/app/[shop]/dashboard/promotions/[id]/edit/page.tsx`
  - Fetch product options and hydrate selected product IDs.
- `src/features/dashboard-promotions/components/forms/create-promotion-form.tsx`
  - Add banner upload/clear UI.
  - Add multi-product selection UI.
- `src/features/dashboard-promotions/components/forms/edit-promotion-form.tsx`
  - Add banner upload/clear UI.
  - Add multi-product selection UI with current selections.
- `src/features/dashboard-promotions/components/tables/promotion-columns.tsx`
  - Add a banner preview column using `next/image`.
- `src/tests/actions/promotions.test.ts`
  - Cover banner image persistence and product connect/set behavior.
- `messages/en.json` and `messages/mm.json`
  - Add promotion form/table labels if needed.
- `docs/progress-tracker.md`
  - Record the implementation after tests pass.

## DB Schema Changes

None. The existing `Promotion.bannerImage` field and `Promotion.products` many-to-many relation are used.

## Component Breakdown

- Keep the create/edit promotion forms as client components.
- Pass serializable product option objects from server pages into the forms.
- Use the existing `ImageUploadField` Cloudinary component for banner uploads.
- Use checkboxes for product multi-selection, with selected product IDs stored in React Hook Form.
- Render a fixed-size banner thumbnail in the dashboard table when `bannerImage` exists, and a muted fallback when it does not.

## Data Flow

1. Server page resolves the current shop and fetches product options.
2. Client form manages promotion fields, banner URL, and selected product IDs through React Hook Form.
3. Safe action validates input, checks shop ownership, verifies all selected products belong to `ctx.shop.id`, then writes the promotion and relation changes.
4. Promotion list revalidates so the banner table column reflects the saved image.
