"use client";

import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  UNIT_OF_MEASURE_OPTIONS,
  type CreateProductInput,
  type VariantInput,
} from "../../validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Edit03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface VariantMatrixTableProps {
  attributes: {
    id: string;
    name: string;
    values: { id: string; value: string }[];
  }[];
}

function labelForValues(
  attributeValueIds: string[],
  attributes: VariantMatrixTableProps["attributes"],
) {
  const allValues = attributes.flatMap((a) => a.values);
  return attributeValueIds
    .map((id) => allValues.find((v) => v.id === id)?.value ?? id)
    .join(" / ");
}

export function VariantMatrixTable({ attributes }: VariantMatrixTableProps) {
  const { control, register, watch, setValue } =
    useFormContext<CreateProductInput>();
  const { fields, remove } = useFieldArray({
    control,
    name: "categoryEngine.variants",
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  if (fields.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No combinations yet. Select attributes above and click &quot;Generate
        combinations&quot;.
      </p>
    );
  }

  const editingVariant =
    editingIndex !== null
      ? watch(`categoryEngine.variants.${editingIndex}`)
      : null;

  return (
    <>
      {/* ── Grid of variant cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fields.map((field, index) => {
          const variant = watch(`categoryEngine.variants.${index}`);
          const label =
            labelForValues(variant?.attributeValueIds ?? [], attributes) ||
            `Variant #${index + 1}`;

          return (
            <div
              key={field.id}
              className={cn(
                "group relative flex flex-col gap-2 rounded-lg border bg-background p-3 transition-shadow hover:shadow-md",
              )}
            >
              {/* Combination label */}
              <span className="truncate text-sm font-semibold">{label}</span>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-1.5">
                {variant?.price != null && (
                  <Badge variant="secondary" className="text-xs font-mono">
                    {variant.price}-MMK
                  </Badge>
                )}
                {variant?.stock != null && (
                  <Badge
                    variant="outline"
                    className={cn("text-xs", {
                      "text-green-600": variant.stock > 0,
                    })}
                  >
                    Qty {variant.stock}
                  </Badge>
                )}
              </div>

              {variant?.sku && (
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {variant.sku}
                </p>
              )}

              {/* Actions — shown on hover */}
              <div className="mt-auto flex items-center gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 flex-1 gap-1 text-xs"
                  onClick={() => setEditingIndex(index)}
                >
                  <HugeiconsIcon icon={Edit03Icon} size={12} />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={editingIndex !== null}
        onOpenChange={(open) => {
          if (!open) setEditingIndex(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Edit variant
              {editingIndex !== null && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {labelForValues(
                    editingVariant?.attributeValueIds ?? [],
                    attributes,
                  ) || `#${editingIndex + 1}`}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {editingIndex !== null && (
            <div className="grid grid-cols-2 gap-4">
              {/* SKU */}
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor={`v-sku-${editingIndex}`}>SKU</Label>
                <Input
                  id={`v-sku-${editingIndex}`}
                  placeholder="e.g. PROD-XL-RED"
                  {...register(
                    `categoryEngine.variants.${editingIndex}.sku` as const,
                  )}
                />
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`v-price-${editingIndex}`}>Price</Label>
                <Input
                  id={`v-price-${editingIndex}`}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register(
                    `categoryEngine.variants.${editingIndex}.price` as const,
                  )}
                />
              </div>

              {/* Compare at price */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`v-compare-${editingIndex}`}>
                  Compare at price
                </Label>
                <Input
                  id={`v-compare-${editingIndex}`}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register(
                    `categoryEngine.variants.${editingIndex}.compareAtPrice` as const,
                  )}
                />
              </div>

              {/* Cost */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`v-cost-${editingIndex}`}>Cost price</Label>
                <Input
                  id={`v-cost-${editingIndex}`}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register(
                    `categoryEngine.variants.${editingIndex}.costPrice` as const,
                  )}
                />
              </div>

              {/* Stock */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`v-stock-${editingIndex}`}>Stock</Label>
                <Input
                  id={`v-stock-${editingIndex}`}
                  type="number"
                  placeholder="0"
                  {...register(
                    `categoryEngine.variants.${editingIndex}.stock` as const,
                  )}
                />
              </div>

              {/* UOM */}
              <div className="flex flex-col gap-1.5">
                <Label>Unit of measure</Label>
                <Select
                  value={
                    watch(`categoryEngine.variants.${editingIndex}.uom`) ||
                    "__base__"
                  }
                  onValueChange={(value) =>
                    setValue(
                      `categoryEngine.variants.${editingIndex}.uom`,
                      value === "__base__"
                        ? ""
                        : (value as CreateProductInput["pricingInventory"]["uom"]),
                      { shouldDirty: true },
                    )
                  }
                >
                  <SelectTrigger className=" w-full">
                    <SelectValue placeholder="Base" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__base__">Base</SelectItem>
                    {UNIT_OF_MEASURE_OPTIONS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit value */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`v-uomval-${editingIndex}`}>
                  Unit value
                  <span className="ml-1 text-xs text-muted-foreground">
                    (QTY PER UOM)
                  </span>
                </Label>
                <Input
                  id={`v-uomval-${editingIndex}`}
                  type="number"
                  step="0.001"
                  placeholder="e.g. 0.5"
                  {...register(
                    `categoryEngine.variants.${editingIndex}.uomValue` as const,
                  )}
                />
              </div>

              {/* Image URL */}
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor={`v-img-${editingIndex}`}>
                  Image URL
                  <span className="ml-1 text-xs text-muted-foreground">
                    (optional, per-variant)
                  </span>
                </Label>
                <Input
                  id={`v-img-${editingIndex}`}
                  placeholder="https://..."
                  {...register(
                    `categoryEngine.variants.${editingIndex}.imageUrl` as const,
                  )}
                />
              </div>

              {/* Backorder */}
              <div className="col-span-2 flex items-center gap-3">
                <Switch
                  id={`v-backorder-${editingIndex}`}
                  checked={watch(
                    `categoryEngine.variants.${editingIndex}.allowBackorder`,
                  )}
                  onCheckedChange={(checked) =>
                    setValue(
                      `categoryEngine.variants.${editingIndex}.allowBackorder`,
                      checked,
                      { shouldDirty: true },
                    )
                  }
                />
                <Label htmlFor={`v-backorder-${editingIndex}`}>
                  Allow backorder
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Done
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
