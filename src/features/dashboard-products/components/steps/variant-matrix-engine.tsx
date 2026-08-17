"use client";

import { useMemo } from "react";
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
  const hasVariants = watch("categoryEngine.hasVariants");
  const basePrice = watch("pricingInventory.price") || 0;
  const slug = watch("basicInfo.slug") || "";
  const selectedAttrIds =
    watch("categoryEngine.selectedAttributeIds") ?? EMPTY_ATTRIBUTE_IDS;

  const selectedAttributes: AttributeInput[] = useMemo(
    () =>
      attributes
        .filter((a) => selectedAttrIds.includes(a.id))
        .map((a) => ({ attributeId: a.id, name: a.name, values: a.values })),
    [attributes, selectedAttrIds],
  );

  function toggleAttribute(id: string) {
    setValue(
      "categoryEngine.selectedAttributeIds",
      selectedAttrIds.includes(id)
        ? selectedAttrIds.filter((x) => x !== id)
        : [...selectedAttrIds, id],
      { shouldDirty: true },
    );
  }

  function generateMatrix() {
    const matrix = generateVariantMatrix(
      slug.toUpperCase(),
      basePrice,
      selectedAttributes,
    );

    // Snapshot existing variants so we can preserve their data for
    // combinations that were already edited (e.g. XL with stock=40).
    const existingVariants = watch("categoryEngine.variants") ?? [];

    // Build a lookup keyed by sorted attributeValueIds for reliable matching.
    const existingByKey = new Map(
      existingVariants.map((v) => [
        [...(v.attributeValueIds ?? [])].sort().join("|"),
        v,
      ]),
    );

    setValue(
      "categoryEngine.variants",
      matrix.map((m) => {
        const key = [...m.attributeValueIds].sort().join("|");
        const existing = existingByKey.get(key);

        // Preserve all data from an already-saved variant; only use
        // generated defaults for combinations that are genuinely new.
        if (existing) {
          return {
            ...existing,
            // Keep the generated SKU only if the existing one is empty.
            sku: existing.sku || m.sku,
            attributeValueIds: m.attributeValueIds,
          };
        }

        return {
          sku: m.sku,
          price: m.price,
          stock: m.stock,
          compareAtPrice: undefined,
          costPrice: undefined,
          imageUrl: "",
          allowBackorder: false,
          uom: "",
          uomValue: undefined,
          isActive: true,
          attributeValueIds: m.attributeValueIds,
        };
      }),
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
            setValue("categoryEngine.hasVariants", checked, {
              shouldDirty: true,
            })
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
            variant="outline"
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

const EMPTY_ATTRIBUTE_IDS: string[] = [];
