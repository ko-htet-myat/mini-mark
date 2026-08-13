/*
  Warnings:

  - You are about to drop the `_ProductToPromotion` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "DiscountType" ADD VALUE 'BUY_X_GET_Y';

-- DropForeignKey
ALTER TABLE "_ProductToPromotion" DROP CONSTRAINT "_ProductToPromotion_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToPromotion" DROP CONSTRAINT "_ProductToPromotion_B_fkey";

-- AlterTable
ALTER TABLE "promotion" ADD COLUMN     "buyProductId" TEXT,
ADD COLUMN     "buyQuantity" DECIMAL(10,3),
ADD COLUMN     "getDiscountPercent" DECIMAL(5,2),
ADD COLUMN     "getProductId" TEXT,
ADD COLUMN     "getQuantity" DECIMAL(10,3),
ALTER COLUMN "discountValue" DROP NOT NULL;

-- DropTable
DROP TABLE "_ProductToPromotion";

-- CreateTable
CREATE TABLE "_PromotionTargetProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PromotionTargetProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PromotionTargetProducts_B_index" ON "_PromotionTargetProducts"("B");

-- CreateIndex
CREATE INDEX "promotion_buyProductId_idx" ON "promotion"("buyProductId");

-- CreateIndex
CREATE INDEX "promotion_getProductId_idx" ON "promotion"("getProductId");

-- AddForeignKey
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_buyProductId_fkey" FOREIGN KEY ("buyProductId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_getProductId_fkey" FOREIGN KEY ("getProductId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromotionTargetProducts" ADD CONSTRAINT "_PromotionTargetProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromotionTargetProducts" ADD CONSTRAINT "_PromotionTargetProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
