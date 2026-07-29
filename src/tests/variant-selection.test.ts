import { describe, expect, it } from "vitest";
import {
  findMatchingVariant,
  getAvailableStockForSelection,
  hasVariantForSelection,
} from "@/features/storefront-products/utils/variant-selection";

const variants = [
  {
    id: "sm-colors",
    stock: 100,
    attributeValueIds: ["black", "blue", "red", "sm"],
  },
  {
    id: "m-colors",
    stock: 20,
    attributeValueIds: ["black", "m", "xl"],
  },
];

describe("variant selection", () => {
  it("matches grouped attribute values on the same variant", () => {
    expect(findMatchingVariant(variants, ["blue", "sm"])?.id).toBe("sm-colors");
  });

  it("does not use aggregate stock for an unavailable combination", () => {
    expect(getAvailableStockForSelection(variants, ["blue", "m"], 120)).toBe(0);
  });

  it("detects whether switching one option keeps a valid variant selection", () => {
    expect(
      hasVariantForSelection(
        variants,
        { color: "blue", size: "sm" },
        "size",
        "m",
      ),
    ).toBe(false);

    expect(
      hasVariantForSelection(
        variants,
        { color: "blue", size: "sm" },
        "color",
        "red",
      ),
    ).toBe(true);
  });
});
