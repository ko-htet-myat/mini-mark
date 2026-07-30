type VariantSelectionItem = {
  attributeValueIds: string[];
};

type StockedVariantSelectionItem = VariantSelectionItem & {
  stock: number;
};

export function variantMatchesSelection(
  variant: VariantSelectionItem,
  selectedAttributeValueIds: string[],
) {
  if (selectedAttributeValueIds.length === 0) {
    return variant.attributeValueIds.length === 0;
  }
  return selectedAttributeValueIds.every((id) =>
    variant.attributeValueIds.includes(id),
  );
}

export function findMatchingVariant<T extends VariantSelectionItem>(
  variants: T[],
  selectedAttributeValueIds: string[],
) {
  return (
    variants.find((variant) =>
      variantMatchesSelection(variant, selectedAttributeValueIds),
    ) ?? null
  );
}

export function hasVariantForSelection(
  variants: VariantSelectionItem[],
  selectedAttributes: Record<string, string>,
  groupId: string,
  valueId: string,
) {
  const nextSelectedValueIds = Object.values({
    ...selectedAttributes,
    [groupId]: valueId,
  }).filter((id) => id !== "");

  if (nextSelectedValueIds.length === 0) return true;

  return variants.some((variant) =>
    variantMatchesSelection(variant, nextSelectedValueIds),
  );
}

export function getAvailableStockForSelection(
  variants: StockedVariantSelectionItem[],
  selectedAttributeValueIds: string[],
  aggregateStock: number,
) {
  if (variants.length === 0) return aggregateStock;

  const matchedVariant = findMatchingVariant(
    variants,
    selectedAttributeValueIds,
  );

  return matchedVariant?.stock ?? 0;
}
