-- Migration: single-shop-category
-- Replace shopCategories (text[]) with shopCategory (ShopCategoryType enum, required)
-- Existing rows: set shopCategory to the first element of shopCategories, or 'OTHER' if empty

ALTER TABLE "Shop"
  ADD COLUMN "shopCategory" "ShopCategoryType";

UPDATE "Shop"
  SET "shopCategory" = CASE
    WHEN array_length("shopCategories", 1) > 0
      THEN ("shopCategories")[1]
    ELSE 'OTHER'::"ShopCategoryType"
  END;

ALTER TABLE "Shop"
  ALTER COLUMN "shopCategory" SET NOT NULL;

ALTER TABLE "Shop"
  DROP COLUMN "shopCategories";
