"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import type { CreateProductInput, VariantInput } from "../../validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";

interface VariantMatrixTableProps {
  attributes: {
    id: string;
    name: string;
    values: { id: string; value: string }[];
  }[];
}

const columnHelper = createColumnHelper<VariantInput & { rowIndex: number }>();

function labelForValues(
  attributeValues: { attributeValueId: string }[],
  attributes: VariantMatrixTableProps["attributes"],
) {
  const allValues = attributes.flatMap((a) => a.values);
  return attributeValues
    .map(
      (av) =>
        allValues.find((v) => v.id === av.attributeValueId)?.value ??
        av.attributeValueId,
    )
    .join(" / ");
}

export function VariantMatrixTable({ attributes }: VariantMatrixTableProps) {
  const { control, register, watch } = useFormContext<CreateProductInput>();
  const { fields, remove } = useFieldArray({ control, name: "variants" });

  const columns = [
    columnHelper.display({
      id: "combination",
      header: "Combination",
      cell: ({ row }) => {
        const variant = watch(`variants.${row.index}`);
        return (
          <span className="text-sm font-medium">
            {labelForValues(variant?.attributeValues ?? [], attributes) ||
              `Variant #${row.index + 1}`}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "sku",
      header: "SKU",
      cell: ({ row }) => (
        <Input
          className="h-8 w-36"
          {...register(`variants.${row.index}.sku` as const)}
        />
      ),
    }),
    columnHelper.display({
      id: "price",
      header: "Price",
      cell: ({ row }) => (
        <Input
          type="number"
          step="0.01"
          className="h-8 w-24"
          {...register(`variants.${row.index}.price` as const)}
        />
      ),
    }),
    columnHelper.display({
      id: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <Input
          type="number"
          className="h-8 w-20"
          {...register(`variants.${row.index}.stock` as const)}
        />
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(row.index)}
        >
          <HugeiconsIcon icon={Delete02Icon} size={16} />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: fields as (VariantInput & { rowIndex: number })[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No combinations yet — select attributes above and click &quot;Generate
        combinations&quot;.
      </p>
    );
  }

  return (
    <div className="rounded-md border bg-background">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
