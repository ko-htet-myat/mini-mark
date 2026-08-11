"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ProductRowActions } from "./product-row-actions";
import { formatAmount } from "@/lib/format";

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  price: number;
  compareAtPrice?: number | null;
  isActive: boolean;
  hasVariants: boolean;
  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  variants: {
    id: string;
    sku?: string | null;
    price?: number | null;
    stock: number;
    status: string;
    imageUrl?: string | null;
    isActive: boolean;
    attributeValues: {
      attributeValue: {
        attribute: { name: string };
        value: string;
      };
    }[];
  }[];
};

function getAggregateStock(variants: ProductRow["variants"]): number {
  return variants
    .filter((v) => v.isActive)
    .reduce((sum, v) => sum + v.stock, 0);
}

interface GetProductColumnsParams {
  page: number;
  pageSize: number;
  tp: {
    product: string;
    category: string;
    brand: string;
    price: string;
    stock: string;
    status: string;
    in_stock: string;
    out_of_stock: string;
    low_stock: string;
    variants: string;
    active: string;
    actions: string;
  };
  serial: string;
  created: string;
  currency: string;
}

export function getProductColumns({
  page,
  pageSize,
  tp,
  serial,
  currency,
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
          {row.original.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.original.imageUrl}
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
      id: "stock",
      header: tp.stock,
      cell: ({ row }) => {
        const hasVariants = row.original.hasVariants;
        const stock = getAggregateStock(row.original.variants);
        return (
          <>
            {stock === 0 ? (
              hasVariants ? (
                <span className={"text-destructive"}>{tp.out_of_stock}</span>
              ) : (
                <span>—</span>
              )
            ) : (
              <>
                <span
                  className={`font-medium ${stock === 0 ? "text-destructive" : ""}`}
                >
                  {stock}{" "}
                </span>
                {stock < 10 ? (
                  <span className={"text-yellow-500"}>({tp.low_stock})</span>
                ) : null}
              </>
            )}
          </>
        );
      },
    },
    {
      id: "price",
      header: tp.price,
      cell: ({ row }) => (
        <span className="font-medium">
          {formatAmount(row.original.price, currency)}
        </span>
      ),
    },
    {
      id: "active",
      header: tp.active,
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? "default" : "secondary"}
          className={row.original.isActive ? "bg-green-600" : ""}
        >
          {row.original.isActive ? "Active" : "Draft"}
        </Badge>
      ),
    },
    // {
    //   id: "variants",
    //   header: tp.variants,
    //   cell: ({ row }) => {
    //     const variants = row.original.variants;
    //     if (!row.original.hasVariants) {
    //       return <span className="text-xs text-muted-foreground">—</span>;
    //     }
    //     return (
    //       <div className="flex flex-wrap gap-1 max-w-[200px]">
    //         {variants.length > 0 ? (
    //           variants.map((v) => {
    //             const attrs = v.attributeValues
    //               .map((av) => av.attributeValue.value)
    //               .join(", ");
    //             return (
    //               <Badge key={v.id} variant="outline" className="text-[10px]">
    //                 {attrs || `#${v.id.slice(0, 6)}`}
    //               </Badge>
    //             );
    //           })
    //         ) : (
    //           <span className="text-xs text-muted-foreground">—</span>
    //         )}
    //       </div>
    //     );
    //   },
    // },
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
