-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE_IN', 'SALE_OUT', 'RETURN_IN', 'DAMAGED_OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'TRANSFER_OUT');

-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "costPrice" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "stock_movement" (
    "id" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "unitCostPrice" DECIMAL(10,2),
    "note" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_movement_variantId_createdAt_idx" ON "stock_movement"("variantId", "createdAt");

-- CreateIndex
CREATE INDEX "stock_movement_productId_idx" ON "stock_movement"("productId");

-- CreateIndex
CREATE INDEX "stock_movement_shopId_idx" ON "stock_movement"("shopId");

-- CreateIndex
CREATE INDEX "stock_movement_referenceType_referenceId_idx" ON "stock_movement"("referenceType", "referenceId");

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
