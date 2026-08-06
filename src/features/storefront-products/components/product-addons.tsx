"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductAddonGroup, ProductAddonOption } from "../types";

export interface SelectedAddon {
  groupName: string;
  option: ProductAddonOption;
}

interface ProductAddonsProps {
  addons: ProductAddonGroup[];
  /** Called whenever the selection changes. Extra total is the sum of all selected option prices. */
  onChange: (selected: SelectedAddon[], extraTotal: number) => void;
}

/**
 * Interactive add-on / modifier selection for RESTAURANT shops.
 * Mirrors the AddonsEngine in the dashboard (groupName, minSelect, maxSelect, options).
 * Groups with maxSelect === 1 render as radio buttons; groups with maxSelect > 1 render
 * as checkboxes capped at maxSelect.
 *
 * Selected addon prices are summed and reported via `onChange` so the parent panel
 * can add them to the displayed total (Option B).
 */
export function ProductAddons({ addons, onChange }: ProductAddonsProps) {
  // selectedByGroup: groupName -> Set of option names
  const [selectedByGroup, setSelectedByGroup] = useState<
    Record<string, Set<string>>
  >(() => {
    const initial: Record<string, Set<string>> = {};
    for (const group of addons) {
      // Pre-select first option if minSelect >= 1
      const preSelected =
        group.minSelect >= 1 && group.options.length > 0
          ? new Set([group.options[0].name])
          : new Set<string>();
      initial[group.groupName] = preSelected;
    }
    return initial;
  });

  // Sync initial pre-selected state with parent
  useEffect(() => {
    const selected = buildSelected(selectedByGroup);
    const extraTotal = selected.reduce((sum, s) => sum + s.option.price, 0);
    onChange(selected, extraTotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildSelected(state: Record<string, Set<string>>) {
    const result: SelectedAddon[] = [];
    for (const group of addons) {
      const picked = state[group.groupName] ?? new Set<string>();
      for (const opt of group.options) {
        if (picked.has(opt.name)) {
          result.push({ groupName: group.groupName, option: opt });
        }
      }
    }
    return result;
  }

  function handleChange(
    group: ProductAddonGroup,
    option: ProductAddonOption,
    checked: boolean,
  ) {
    // Calculate new state synchronously
    const next = { ...selectedByGroup };
    const current = new Set(next[group.groupName] ?? new Set<string>());

    if (group.maxSelect === 1) {
      // Radio behaviour
      next[group.groupName] = new Set([option.name]);
    } else {
      if (checked) {
        if (current.size < group.maxSelect) {
          current.add(option.name);
        }
      } else {
        current.delete(option.name);
      }
      next[group.groupName] = current;
    }

    // Apply state
    setSelectedByGroup(next);

    // Fire callback outside of the React state updater function
    const selected = buildSelected(next);
    const extraTotal = selected.reduce((sum, s) => sum + s.option.price, 0);
    onChange(selected, extraTotal);
  }

  return (
    <div className="flex flex-col gap-5">
      {addons.map((group) => {
        const picked = selectedByGroup[group.groupName] ?? new Set<string>();
        const isRadio = group.maxSelect === 1;

        return (
          <div key={group.groupName}>
            <div className="mb-2 flex items-baseline gap-2">
              <p className="text-sm font-medium">{group.groupName}</p>
              {group.minSelect > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Required
                </span>
              )}
              {group.maxSelect > 1 && (
                <span className="text-[10px] text-muted-foreground">
                  Choose up to {group.maxSelect}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {group.options.map((option) => {
                const isChecked = picked.has(option.name);
                const isDisabled =
                  !isRadio && !isChecked && picked.size >= group.maxSelect;

                return (
                  <label
                    key={option.name}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors",
                      isChecked
                        ? "border-foreground bg-foreground/5"
                        : "border-border bg-background hover:border-foreground/30",
                      isDisabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Custom radio / checkbox indicator */}
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
                          isRadio ? "rounded-full" : "rounded-sm",
                          isChecked
                            ? "border-foreground bg-foreground"
                            : "border-border",
                        )}
                      >
                        {isChecked && (
                          <span className="h-1.5 w-1.5 rounded-full bg-background" />
                        )}
                      </span>
                      <span>{option.name}</span>
                    </div>

                    {option.price > 0 && (
                      <span className="ml-2 font-medium text-muted-foreground">
                        +{option.price.toLocaleString()}
                      </span>
                    )}

                    <input
                      type={isRadio ? "radio" : "checkbox"}
                      className="sr-only"
                      name={group.groupName}
                      value={option.name}
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={(e) =>
                        handleChange(group, option, e.target.checked)
                      }
                    />
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
