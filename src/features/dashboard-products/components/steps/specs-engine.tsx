"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { CreateProductInput } from "../../validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Add01Icon } from "@hugeicons/core-free-icons";

/**
 * ELECTRONICS / AUTOMOTIVE — arbitrary key-value technical specs,
 * stored directly on Product.specifications (Json).
 */
export function SpecsEngine() {
  const { watch, setValue } = useFormContext<CreateProductInput>();
  const specifications = (watch("categoryEngine.specifications") ??
    {}) as Record<string, string>;
  const [key, setKey] = useState("");
  const [value, setValue_] = useState("");

  const entries = Object.entries(specifications);

  function addSpec() {
    if (!key.trim() || !value.trim()) return;
    setValue(
      "categoryEngine.specifications",
      {
        ...specifications,
        [key.trim()]: value.trim(),
      },
      { shouldDirty: true },
    );
    setKey("");
    setValue_("");
  }

  function removeSpec(k: string) {
    const next = { ...specifications };
    delete next[k];
    setValue("categoryEngine.specifications", next, { shouldDirty: true });
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <h3 className="font-medium">Technical specifications</h3>
      <p className="text-xs text-muted-foreground">
        Add key details like RAM, Storage, Warranty, or Voltage.
      </p>

      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map(([k, v]) => (
            <li
              key={k}
              className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
            >
              <span>
                <span className="font-medium">{k}</span>: {v}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSpec(k)}
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <Input
          placeholder="Spec name (e.g. RAM)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <Input
          placeholder="Value (e.g. 16GB)"
          value={value}
          onChange={(e) => setValue_(e.target.value)}
        />
        <Button type="button" variant="secondary" onClick={addSpec}>
          <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
