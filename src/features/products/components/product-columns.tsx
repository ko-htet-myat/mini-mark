"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ProductRowActions } from "./product-row-actions";

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  stock: number;
  isActive: boolean;
  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  attributeValues: {
    attributeValue: {
      attribute: { name: string };
      value: string;
    };
  }[];
  promotions: { id: string; name: string }[];
};

interface GetProductColumnsParams {
  page: number;
  pageSize: number;
  tp: {
    product: string;
    category: string;
    brand: string;
    price: string;
    stock: string;
    attributes: string;
    active: string;
    actions: string;
  };
  serial: string;
  created: string;
}

export function getProductColumns({
  page,
  pageSize,
  tp,
  serial,
}: GetProductColumnsParams): ColumnDef<ProductRow>[] {
  return [
    {
      id: "serial",
      header: serial,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {page * pageSize + row.index + 1}
        </span>
      ),
      size: 48,
    },
    {
      id: "product",
      header: tp.product,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.original.images[0]}
              alt={row.original.name}
              className="h-10 w-10 rounded object-cover border"
            />
          ) : (
            <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
              —
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: tp.category,
      cell: ({ row }) =>
        row.original.category ? (
          <Badge variant="outline">{row.original.category.name}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: "brand",
      header: tp.brand,
      cell: ({ row }) =>
        row.original.brand ? (
          <Badge variant="secondary">{row.original.brand.name}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: "price",
      header: tp.price,
      cell: ({ row }) => (
        <span className="font-medium">${row.original.price.toFixed(2)}</span>
      ),
    },
    {
      id: "stock",
      header: tp.stock,
      cell: ({ row }) => (
        <span
          className={`font-medium ${row.original.stock === 0 ? "text-destructive" : ""}`}
        >
          {row.original.stock}
        </span>
      ),
    },
    {
      id: "attributes",
      header: tp.attributes,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.attributeValues.length > 0 ? (
            row.original.attributeValues.map((av, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px]">
                {av.attributeValue.attribute.name}: {av.attributeValue.value}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ProductRowActions
          productId={row.original.id}
          productName={row.original.name}
        />
      ),
    },
  ];
}
