"use client";

import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { CreateProductInput } from "../../validations";
import {
  generateVariantMatrix,
  type AttributeInput,
} from "../../utils/cartesian";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { VariantMatrixTable } from "../tables/variant-matrix-table";

interface VariantMatrixEngineProps {
  attributes: {
    id: string;
    name: string;
    values: { id: string; value: string }[];
  }[];
}

/**
 * FASHION / SPORTS / GROCERY / etc. — toggle "has variants", pick attributes,
 * generate the Cartesian matrix, then edit price/stock/SKU per row.
 */
export function VariantMatrixEngine({ attributes }: VariantMatrixEngineProps) {
  const { watch, setValue } = useFormContext<CreateProductInput>();
  const hasVariants = watch("hasVariants");
  const basePrice = watch("price") || 0;
  const slug = watch("slug") || "";

  const [selectedAttrIds, setSelectedAttrIds] = useState<string[]>([]);

  const selectedAttributes: AttributeInput[] = useMemo(
    () =>
      attributes
        .filter((a) => selectedAttrIds.includes(a.id))
        .map((a) => ({ attributeId: a.id, name: a.name, values: a.values })),
    [attributes, selectedAttrIds],
  );

  function toggleAttribute(id: string) {
    setSelectedAttrIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function generateMatrix() {
    const matrix = generateVariantMatrix(
      slug.toUpperCase(),
      basePrice,
      selectedAttributes,
    );
    setValue(
      "variants",
      matrix.map((m) => ({
        sku: m.sku,
        price: m.price,
        stock: m.stock,
        isActive: true,
        // attributeValues matches the Zod schema: { attributeValueId: string }[]
        attributeValues: m.attributeValues,
      })),
      { shouldDirty: true },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch
          id="hasVariants"
          checked={hasVariants}
          onCheckedChange={(checked) =>
            setValue("hasVariants", checked, { shouldDirty: true })
          }
        />
        <Label htmlFor="hasVariants">
          This product has multiple variants (Color, Size, Weight…)
        </Label>
      </div>

      {hasVariants && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
          <div>
            <h3 className="font-medium">Generate variant matrix</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select attributes to automatically calculate stock combinations.
            </p>
          </div>

          {attributes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No attributes defined for this shop. Add attributes first to use
              the variant matrix.
            </p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {attributes.map((attr) => (
                <label
                  key={attr.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={selectedAttrIds.includes(attr.id)}
                    onCheckedChange={() => toggleAttribute(attr.id)}
                  />
                  {attr.name}
                </label>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={selectedAttributes.length === 0 || !basePrice}
            onClick={generateMatrix}
          >
            Generate combinations
          </Button>

          <VariantMatrixTable attributes={attributes} />
        </div>
      )}
    </div>
  );
}
