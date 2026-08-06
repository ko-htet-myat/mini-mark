"use client";

import type { $Enums } from "@/generated/prisma/client";
import { SpecsEngine } from "./specs-engine";
import { AddonsEngine } from "./addons-engine";
import { VariantMatrixEngine } from "./variant-matrix-engine";

type ShopCategoryType = $Enums.ShopCategoryType;

interface EngineRouterProps {
  shopCategory: ShopCategoryType;
  attributes: {
    id: string;
    name: string;
    values: { id: string; value: string }[];
  }[];
}

/**
 * Maps ShopCategoryType -> the input UI(s) shown in Step 2.
 * Mirrors the Category Classification & Engine Mapping Matrix in
 * PRODUCT_CREATION_FLOW_INSTRUCTION.md.
 */
export function EngineRouter({ shopCategory, attributes }: EngineRouterProps) {
  switch (shopCategory) {
    case "RESTAURANT":
      return <AddonsEngine />;

    case "ELECTRONICS":
    case "AUTOMOTIVE":
      return (
        <div className="space-y-4">
          <SpecsEngine />
          <VariantMatrixEngine attributes={attributes} />
        </div>
      );

    case "HOME_GARDEN":
    case "BEAUTY":
      return (
        <div className="space-y-4">
          <VariantMatrixEngine attributes={attributes} />
          <SpecsEngine />
        </div>
      );

    // FASHION, SPORTS, GROCERY, LIQUOR_STORE, HEALTH, RETAIL,
    // SERVICES, BOOKS_STATIONERY, OTHER
    default:
      return <VariantMatrixEngine attributes={attributes} />;
  }
}
