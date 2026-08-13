-- AlterTable
ALTER TABLE "product" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "isOutOfStock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxOrderQuantity" INTEGER,
ADD COLUMN     "minOrderQuantity" INTEGER;
