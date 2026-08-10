import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { updateShopSchema } from "@/features/shop/validations/edit";

export type SettingsFormApi = UseFormReturn<
  z.input<typeof updateShopSchema>,
  unknown,
  z.output<typeof updateShopSchema>
>;
