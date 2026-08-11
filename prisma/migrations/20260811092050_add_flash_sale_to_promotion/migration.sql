-- AlterTable
ALTER TABLE "promotion" ADD COLUMN     "isFlashSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxRedemptions" INTEGER,
ADD COLUMN     "redemptionCount" INTEGER NOT NULL DEFAULT 0;
