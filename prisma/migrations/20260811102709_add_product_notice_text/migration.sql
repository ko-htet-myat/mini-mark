-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'URGENT');

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "noticeText" TEXT,
ADD COLUMN     "noticeType" "NoticeType";

-- AlterTable
ALTER TABLE "product_variant" ADD COLUMN     "costPrice" DECIMAL(10,2);
