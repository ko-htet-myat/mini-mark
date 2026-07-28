import ExcelJS from "exceljs";
import type { PassThrough } from "node:stream";

// Adjust to your actual generated Prisma client path.
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const BATCH_SIZE = 1000;

export interface ProductExportFilters {
  name?: string;
  categoryId?: string;
  brandId?: string;
  /** "all" (default) | "active" | "inactive" — mirrors the list's status filter */
  status?: "all" | "active" | "inactive";
  /** ISO date strings, inclusive, matching the list's date-range filter */
  dateFrom?: string;
  dateTo?: string;
}

const COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: "Name", key: "name", width: 32 },
  { header: "SKU", key: "sku", width: 16 },
  { header: "Slug", key: "slug", width: 24 },
  { header: "Category", key: "category", width: 20 },
  { header: "Brand", key: "brand", width: 20 },
  {
    header: "Price",
    key: "price",
    width: 14,
    style: { numFmt: '"$"#,##0.00' },
  },
  {
    header: "Compare-at Price",
    key: "compareAtPrice",
    width: 18,
    style: { numFmt: '"$"#,##0.00' },
  },
  { header: "Stock", key: "stock", width: 10 },
  { header: "Active", key: "isActive", width: 10 },
  {
    header: "Created At",
    key: "createdAt",
    width: 18,
    style: { numFmt: "yyyy-mm-dd" },
  },
];

/** Turns the export filter params into a Prisma where clause, scoped to the shop. */
function buildWhere(
  shopId: string,
  filters: ProductExportFilters,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { shopId };

  if (filters.name?.trim()) {
    where.name = { contains: filters.name.trim(), mode: "insensitive" };
  }
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.brandId) {
    where.brandId = filters.brandId;
  }
  if (filters.status === "active") {
    where.isActive = true;
  } else if (filters.status === "inactive") {
    where.isActive = false;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      // include the whole "to" day
      ...(filters.dateTo
        ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) }
        : {}),
    };
  }

  return where;
}

/**
 * Streams a filtered products workbook for `shopId` directly into `output`.
 * Applies the same filters as the dashboard product list so the export
 * always matches what the user is currently looking at.
 */
export async function streamProductsWorkbook(
  shopId: string,
  output: PassThrough,
  filters: ProductExportFilters = {},
) {
  const where = buildWhere(shopId, filters);

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: output,
    useStyles: true,
  });

  const sheet = workbook.addWorksheet("Products", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = COLUMNS;

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F2937" },
  };
  headerRow.commit();

  let cursor: string | undefined;
  let rowNumber = 1; // header already written
  let totalRows = 0;

  while (true) {
    const batch = await prisma.product.findMany({
      where,
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" }, // stable order required for cursor pagination
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    if (batch.length === 0) break;

    for (const product of batch) {
      rowNumber++;
      const row = sheet.getRow(rowNumber);
      row.values = {
        name: product.name,
        slug: product.slug,
        category: product.category?.name ?? "—",
        brand: product.brand?.name ?? "—",
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice
          ? Number(product.compareAtPrice)
          : null,
        isActive: product.isActive ? "Yes" : "No",
        createdAt: product.createdAt,
      };
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF9FAFB" },
        };
      }
      row.commit();
    }

    totalRows += batch.length;
    cursor = batch[batch.length - 1].id;
    if (batch.length < BATCH_SIZE) break; // last page
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: COLUMNS.length },
  };

  // If filters produced zero rows, leave a friendly note rather than a blank sheet.
  if (totalRows === 0) {
    const emptyRow = sheet.getRow(2);
    emptyRow.getCell(1).value = "No products match the current filters.";
    emptyRow.commit();
  }

  sheet.commit();
  await workbook.commit();
}
