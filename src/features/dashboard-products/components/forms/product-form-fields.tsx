"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductFormGeneralTab } from "./product-form-general-tab";
import { ProductFormAdvanceTab } from "./product-form-advance-tab";
import { ProductFormRightColumn } from "./product-form-right-column";
import { ProductFormFieldsProps } from "./product-form-types";

export * from "./product-form-types";

export function ProductFormFields(props: ProductFormFieldsProps) {
  const { isPending, serverError, tc, submitLabel, onCancel } = props;

  return (
    <>
      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="advance">Advance</TabsTrigger>
            </TabsList>

            <ProductFormGeneralTab {...props} />
            <ProductFormAdvanceTab {...props} />
          </Tabs>
        </div>

        {/* RIGHT COLUMN */}
        <ProductFormRightColumn {...props} />
      </div>

      {serverError && (
        <p className="text-sm text-destructive mt-6">{serverError}</p>
      )}

      <div className="flex gap-4 mt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? tc("saving") : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </>
  );
}
