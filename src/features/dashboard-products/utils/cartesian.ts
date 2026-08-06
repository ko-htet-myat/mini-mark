export interface AttributeInput {
  attributeId: string;
  name: string;
  values: { id: string; value: string }[];
}

export interface GeneratedVariant {
  combinationName: string;
  /** Matches Zod schema: `variants[].attributeValues[].attributeValueId` */
  attributeValues: { attributeValueId: string }[];
  sku: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

interface ComboEntry {
  attributeId: string;
  attributeName: string;
  valueId: string;
  valueName: string;
}

/**
 * Computes the Cartesian product of selected attribute values and formats
 * default ProductVariant payloads (SKU, name, starting price/stock).
 *
 * Example: Color: [Red, Blue] x Size: [S, M]
 *   -> Red / S, Red / M, Blue / S, Blue / M
 */
export function generateVariantMatrix(
  baseSkuPrefix: string,
  basePrice: number,
  attributes: AttributeInput[],
): GeneratedVariant[] {
  if (attributes.length === 0) return [];

  const groups: ComboEntry[][] = attributes.map((attr) =>
    attr.values.map((val) => ({
      attributeId: attr.attributeId,
      attributeName: attr.name,
      valueId: val.id,
      valueName: val.value,
    })),
  );

  const combinations = groups.reduce<ComboEntry[][]>(
    (acc, group) =>
      acc.flatMap((combo) => group.map((entry) => [...combo, entry])),
    [[]],
  );

  return combinations.map((combo) => {
    const combinationName = combo.map((c) => c.valueName).join(" / ");
    const attributeValues = combo.map((c) => ({ attributeValueId: c.valueId }));

    const skuSuffix = combo
      .map((c) => c.valueName.toUpperCase().replace(/\s+/g, ""))
      .join("-");
    const sku = baseSkuPrefix ? `${baseSkuPrefix}-${skuSuffix}` : skuSuffix;

    return {
      combinationName,
      attributeValues,
      sku,
      price: basePrice,
      stock: 0,
    };
  });
}
