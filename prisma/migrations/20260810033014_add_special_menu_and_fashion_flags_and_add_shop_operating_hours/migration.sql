-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "isBestSellerItem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCollection" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSpecialMenu" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "shop_operating_hours" (
    "id" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "openTime" TEXT,
    "closeTime" TEXT,
    "shopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_operating_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shop_operating_hours_shopId_idx" ON "shop_operating_hours"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_operating_hours_shopId_dayOfWeek_key" ON "shop_operating_hours"("shopId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "shop_operating_hours" ADD CONSTRAINT "shop_operating_hours_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
