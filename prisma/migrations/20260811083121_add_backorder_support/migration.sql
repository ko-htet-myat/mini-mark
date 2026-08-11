-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "isBackorder" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "product_variant" ADD COLUMN     "allowBackorder" BOOLEAN NOT NULL DEFAULT false;
