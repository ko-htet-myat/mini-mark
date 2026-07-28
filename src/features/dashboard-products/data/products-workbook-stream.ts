import ExcelJS from "exceljs";
import type { PassThrough } from "node:stream";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const BATCH_SIZE = 1000;

export interface ProductExportFilters {
  name?: string;
  categoryId?: string;
  brandId?: string;
  status?: "all" | "active" | "draft";
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
}

const COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: "Name", key: "name", width: 32 },
  { header: "SKU", key: "sku", width: 24 },
  { header: "Slug", key: "slug", width: 24 },
  { header: "Category", key: "category", width: 20 },
  { header: "Brand", key: "brand", width: 20 },
  {
    header: "Price",
    key: "price",
    width: 14,
    style: { numFmt: "#,##0.00" },
  },
  {
    header: "Compare-at Price",
    key: "compareAtPrice",
    width: 18,
    style: { numFmt: "#,##0.00" },
  },
  { header: "Stock", key: "stock", width: 10 },
  { header: "Status", key: "status", width: 10 },
  {
    header: "Created At",
    key: "createdAt",
    width: 18,
    style: { numFmt: "yyyy-mm-dd" },
  },
];

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
  } else if (filters.status === "draft") {
    where.isActive = false;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo
        ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) }
        : {}),
    };
  }

  return where;
}

function getVariantSkuSummary(
  variants: { sku: string | null }[],
): string | null {
  const skus = variants.map((variant) => variant.sku).filter(Boolean);
  return skus.length > 0 ? skus.join(", ") : null;
}

function getAggregateStock(variants: { stock: number; isActive: boolean }[]) {
  return variants
    .filter((variant) => variant.isActive)
    .reduce((sum, variant) => sum + variant.stock, 0);
}

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

  let rowNumber = 1;
  let totalRows = 0;
  const remaining = filters.limit ?? Infinity;

  const isPaginated =
    filters.page !== undefined && filters.pageSize !== undefined;

  if (isPaginated) {
    const batch = await prisma.product.findMany({
      where,
      skip: filters.page! * filters.pageSize!,
      take: Math.min(filters.pageSize!, remaining),
      orderBy: { createdAt: "desc" },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        variants: { select: { sku: true, stock: true, isActive: true } },
      },
    });

    for (const product of batch) {
      rowNumber++;
      const row = sheet.getRow(rowNumber);
      row.values = {
        name: product.name,
        sku: getVariantSkuSummary(product.variants),
        slug: product.slug,
        category: product.category?.name ?? "-",
        brand: product.brand?.name ?? "-",
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice
          ? Number(product.compareAtPrice)
          : null,
        stock: getAggregateStock(product.variants),
        status: product.isActive ? "Active" : "Draft",
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

    totalRows = batch.length;
  } else {
    let cursor: string | undefined;

    while (totalRows < remaining) {
      const batch = await prisma.product.findMany({
        where,
        take: Math.min(BATCH_SIZE, remaining - totalRows),
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: "asc" },
        include: {
          brand: { select: { name: true } },
          category: { select: { name: true } },
          variants: { select: { sku: true, stock: true, isActive: true } },
        },
      });

      if (batch.length === 0) break;

      for (const product of batch) {
        rowNumber++;
        const row = sheet.getRow(rowNumber);
        row.values = {
          name: product.name,
          sku: getVariantSkuSummary(product.variants),
          slug: product.slug,
          category: product.category?.name ?? "-",
          brand: product.brand?.name ?? "-",
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : null,
          stock: getAggregateStock(product.variants),
          status: product.isActive ? "Active" : "Draft",
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
      if (batch.length < BATCH_SIZE || totalRows >= remaining) break;
    }
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: COLUMNS.length },
  };

  if (totalRows === 0) {
    const emptyRow = sheet.getRow(2);
    emptyRow.getCell(1).value = "No products match the current filters.";
    emptyRow.commit();
  }

  sheet.commit();
  await workbook.commit();
}
