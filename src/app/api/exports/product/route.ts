import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { PassThrough, Readable } from "node:stream";

import { streamProductsWorkbook } from "@/features/dashboard-products/data/products-workbook-stream";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import type { ProductExportFilters } from "@/features/dashboard-products/data/products-workbook-stream";

function parseFilters(searchParams: URLSearchParams): ProductExportFilters {
  const status = searchParams.get("status");
  const pageRaw = searchParams.get("page");
  const pageSizeRaw = searchParams.get("pageSize");
  const page = pageRaw ? Number(pageRaw) : undefined;
  const pageSize = pageSizeRaw ? Number(pageSizeRaw) : undefined;
  return {
    name: searchParams.get("name") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    brandId: searchParams.get("brandId") ?? undefined,
    status:
      status === "active" || status === "draft" ? status : ("all" as const),
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    page: page !== undefined && page >= 0 ? page : undefined,
    pageSize: pageSize && pageSize > 0 ? pageSize : undefined,
  };
}

export async function GET(req: NextRequest) {
  const shopSlug = req.nextUrl.searchParams.get("shop");

  if (!shopSlug) {
    return NextResponse.json({ error: "Shop is required" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = await prisma.shop.findUnique({
    where: { slug: shopSlug },
    select: { id: true, ownerId: true },
  });

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  if (shop.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const filters = parseFilters(req.nextUrl.searchParams);
  const passthrough = new PassThrough();

  streamProductsWorkbook(shop.id, passthrough, filters).catch((err) => {
    console.error("Product export failed mid-stream:", err);
    passthrough.destroy(err);
  });

  const filename = `products-${shopSlug}-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(Readable.toWeb(passthrough) as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
