"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { CreateProductInput } from "../../validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Add01Icon } from "@hugeicons/core-free-icons";

/**
 * RESTAURANT — modifier / add-on groups (e.g. "Choice of Cheese").
 * Stored on Product.addons (Json). Bypasses the SKU/ProductVariant matrix.
 */
export function AddonsEngine() {
  const { control } = useFormContext<CreateProductInput>();
  const {
    fields: groups,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({ control, name: "categoryEngine.addons" });

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
      <div>
        <h3 className="font-medium">Food modifiers &amp; add-ons</h3>
        <p className="text-xs text-muted-foreground">
          e.g. Extra Cheese, Spice Level, or Preparation choice.
        </p>
      </div>

      {groups.map((group, groupIndex) => (
        <AddonGroupFields
          key={group.id}
          groupIndex={groupIndex}
          onRemoveGroup={() => removeGroup(groupIndex)}
        />
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          appendGroup({
            groupName: "",
            minSelect: 0,
            maxSelect: 1,
            options: [{ name: "", price: 0 }],
          })
        }
      >
        <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" />
        Add option group
      </Button>
    </div>
  );
}

function AddonGroupFields({
  groupIndex,
  onRemoveGroup,
}: {
  groupIndex: number;
  onRemoveGroup: () => void;
}) {
  const { control, register } = useFormContext<CreateProductInput>();
  const {
    fields: options,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `categoryEngine.addons.${groupIndex}.options`,
  });

  return (
    <div className="rounded-md border bg-background p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Group name (e.g. Choice of Cheese)"
          {...register(
            `categoryEngine.addons.${groupIndex}.groupName` as const,
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemoveGroup}
        >
          <HugeiconsIcon icon={Delete02Icon} size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Min select</label>
          <Input
            type="number"
            min={0}
            {...register(
              `categoryEngine.addons.${groupIndex}.minSelect` as const,
            )}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Max select</label>
          <Input
            type="number"
            min={1}
            {...register(
              `categoryEngine.addons.${groupIndex}.maxSelect` as const,
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        {options.map((opt, optIndex) => (
          <div key={opt.id} className="flex items-center gap-2">
            <Input
              placeholder="Option name (e.g. Cheddar)"
              {...register(
                `categoryEngine.addons.${groupIndex}.options.${optIndex}.name` as const,
              )}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Extra price"
              className="w-32"
              {...register(
                `categoryEngine.addons.${groupIndex}.options.${optIndex}.price` as const,
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(optIndex)}
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendOption({ name: "", price: 0 })}
        >
          <HugeiconsIcon icon={Add01Icon} size={14} className="mr-1" />
          Add option
        </Button>
      </div>
    </div>
  );
}
