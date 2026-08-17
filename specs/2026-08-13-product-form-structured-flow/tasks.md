# Product Form Structured Flow Tasks

- [x] Update validation schemas to the nested product form contract.
  - [x] Add product-level inventory and merchandising fields.
  - [x] Add expanded variant fields.
  - [x] Add cross-field validation for order quantity limits if approved.

- [x] Update server actions for structured create/update/duplicate payloads.
  - [x] Map nested product fields into Prisma product writes.
  - [x] Map nested variant fields into Prisma variant writes.
  - [x] Keep specs/addons persistence category-aware.
  - [x] Add distinct unique-conflict handling if approved.

- [x] Update product data queries and edit hydration.
  - [x] Serialize newer product fields.
  - [x] Serialize newer variant fields.
  - [x] Build nested `initialData` for edit mode.

- [x] Rebuild wizard step structure.
  - [x] Convert existing base info step to `basicInfo`.
  - [x] Add pricing & inventory step.
  - [x] Convert category engine components to `categoryEngine`.
  - [x] Add merchandising & SEO step.
  - [x] Convert review step to read-only grouped review.

- [x] Update variant matrix generation and table controls.
  - [x] Use `attributeValueIds` for generated combinations.
  - [x] Add controls for cost price, compare-at price, backorder, unit override, unit value, image URL, and stock.
  - [x] Keep the table usable at dashboard widths.

- [x] Update tests.
  - [x] Migrate existing action tests to nested inputs.
  - [x] Add persistence tests for product inventory fields.
  - [x] Add persistence tests for merchandising flags.
  - [x] Add persistence tests for expanded variant fields.
  - [x] Add duplicate tests for newer fields.

- [x] Verify and document completion.
  - [x] Run associated tests.
  - [x] Run lint if the implementation touches form UI broadly.
  - [x] Update `docs/progress-tracker.md` after implementation.
