import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { PassThrough, Readable } from "node:stream";

// Adjust these two imports to match your actual project paths.
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ProductExportFilters,
  streamProductsWorkbook,
} from "@/features/dashboard-products/data/products-workbook-stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseFilters(searchParams: URLSearchParams): ProductExportFilters {
  const status = searchParams.get("status");
  return {
    name: searchParams.get("name") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    brandId: searchParams.get("brandId") ?? undefined,
    status: status === "active" || status === "inactive" ? status : "all",
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shop: string }> },
) {
  const { shop: shopSlug } = await params;

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
