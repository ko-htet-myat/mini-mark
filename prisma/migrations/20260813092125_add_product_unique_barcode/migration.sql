/*
  Warnings:

  - A unique constraint covering the columns `[shopId,barcode]` on the table `product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "product_shopId_barcode_key" ON "product"("shopId", "barcode");
