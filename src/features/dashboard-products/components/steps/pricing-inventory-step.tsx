"use client";

import { useFormContext } from "react-hook-form";
import type { CreateProductInput } from "../../validations";
import { UNIT_OF_MEASURE_OPTIONS } from "../../validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PricingInventoryStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateProductInput>();

  const pricingErrors = errors.pricingInventory;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="price">
          Base price <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register("pricingInventory.price")}
        />
        {pricingErrors?.price && (
          <p className="text-sm text-destructive">
            {pricingErrors.price.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Unit of measure</Label>
        <Select
          value={watch("pricingInventory.uom")}
          onValueChange={(value) =>
            setValue(
              "pricingInventory.uom",
              value as CreateProductInput["pricingInventory"]["uom"],
              {
                shouldDirty: true,
              },
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {UNIT_OF_MEASURE_OPTIONS.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="compareAtPrice">Compare-at price</Label>
        <Input
          id="compareAtPrice"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register("pricingInventory.compareAtPrice")}
        />
        {pricingErrors?.compareAtPrice && (
          <p className="text-sm text-destructive">
            {pricingErrors.compareAtPrice.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="costPrice">Cost price</Label>
        <Input
          id="costPrice"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register("pricingInventory.costPrice")}
        />
        {pricingErrors?.costPrice && (
          <p className="text-sm text-destructive">
            {pricingErrors.costPrice.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="barcode">Barcode</Label>
        <Input
          id="barcode"
          placeholder="Scan or enter barcode"
          {...register("pricingInventory.barcode")}
        />
        {pricingErrors?.barcode && (
          <p className="text-sm text-destructive">
            {pricingErrors.barcode.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div>
          <Label htmlFor="isOutOfStock" className="text-sm font-medium">
            Mark as out of stock
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Overrides variant stock availability in storefront displays.
          </p>
        </div>
        <Switch
          id="isOutOfStock"
          checked={watch("pricingInventory.isOutOfStock")}
          onCheckedChange={(checked) =>
            setValue("pricingInventory.isOutOfStock", checked, {
              shouldDirty: true,
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="minOrderQuantity">Minimum order quantity</Label>
        <Input
          id="minOrderQuantity"
          type="number"
          min="1"
          {...register("pricingInventory.minOrderQuantity")}
        />
        {pricingErrors?.minOrderQuantity && (
          <p className="text-sm text-destructive">
            {pricingErrors.minOrderQuantity.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="maxOrderQuantity">Maximum order quantity</Label>
        <Input
          id="maxOrderQuantity"
          type="number"
          min="1"
          {...register("pricingInventory.maxOrderQuantity")}
        />
        {pricingErrors?.maxOrderQuantity && (
          <p className="text-sm text-destructive">
            {pricingErrors.maxOrderQuantity.message}
          </p>
        )}
      </div>
    </section>
  );
}
