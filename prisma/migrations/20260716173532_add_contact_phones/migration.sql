/*
  Warnings:

  - You are about to drop the column `contactPhone` on the `Shop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "contactPhone",
ADD COLUMN     "contactPhones" TEXT[] DEFAULT ARRAY[]::TEXT[];
