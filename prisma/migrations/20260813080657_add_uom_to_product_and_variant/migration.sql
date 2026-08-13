-- CreateEnum
CREATE TYPE "UnitOfMeasure" AS ENUM ('PCS', 'KG', 'G', 'L', 'ML', 'PACK', 'BOX', 'DOZEN', 'METER', 'CM', 'SET');

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "uom" "UnitOfMeasure" NOT NULL DEFAULT 'PCS';

-- AlterTable
ALTER TABLE "product_variant" ADD COLUMN     "uom" "UnitOfMeasure",
ADD COLUMN     "uomValue" DECIMAL(10,3);
