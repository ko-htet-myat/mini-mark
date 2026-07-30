"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterIcon,
  Calendar01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface ProductTableFilterProps {
  categories?: { id: string; name: string }[];
  statusFilter?: string;
  categoryIdFilter?: string;
  fromFilter?: string;
  toFilter?: string;
  pushParams: (updates: Record<string, string | number>) => void;
}

export function ProductTableFilter({
  categories = [],
  statusFilter,
  categoryIdFilter,
  fromFilter,
  toFilter,
  pushParams,
}: ProductTableFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterState, setFilterState] = useState({
    status: statusFilter || "",
    categoryId: categoryIdFilter || "",
    from: fromFilter || "",
    to: toFilter || "",
  });

  const [prevFilters, setPrevFilters] = useState({
    statusFilter,
    categoryIdFilter,
    fromFilter,
    toFilter,
  });
  if (
    statusFilter !== prevFilters.statusFilter ||
    categoryIdFilter !== prevFilters.categoryIdFilter ||
    fromFilter !== prevFilters.fromFilter ||
    toFilter !== prevFilters.toFilter
  ) {
    setPrevFilters({ statusFilter, categoryIdFilter, fromFilter, toFilter });
    setFilterState({
      status: statusFilter || "",
      categoryId: categoryIdFilter || "",
      from: fromFilter || "",
      to: toFilter || "",
    });
  }

  const fromDate = filterState.from ? parseISO(filterState.from) : undefined;
  const toDate = filterState.to ? parseISO(filterState.to) : undefined;

  return (
    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <HugeiconsIcon icon={FilterIcon} size={16} />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-medium">Filter</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={() => setIsFilterOpen(false)}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </Button>
        </div>

        <div className="px-4 space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Category</label>
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() =>
                  setFilterState((s) => ({ ...s, categoryId: "" }))
                }
              >
                Reset
              </button>
            </div>
            <Select
              value={filterState.categoryId || "all"}
              onValueChange={(v) =>
                setFilterState((s) => ({
                  ...s,
                  categoryId: v === "all" ? "" : v,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Category</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Status</label>
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => setFilterState((s) => ({ ...s, status: "" }))}
              >
                Reset
              </button>
            </div>
            <Select
              value={filterState.status || "all"}
              onValueChange={(v) =>
                setFilterState((s) => ({
                  ...s,
                  status: v === "all" ? "" : v,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range — two separate pickers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Date Range</label>
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() =>
                  setFilterState((s) => ({ ...s, from: "", to: "" }))
                }
              >
                Reset
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Date From */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Date from</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-sm",
                        !fromDate && "text-muted-foreground",
                      )}
                    >
                      <HugeiconsIcon
                        icon={Calendar01Icon}
                        className="mr-1 shrink-0"
                        size={14}
                      />
                      {fromDate ? format(fromDate, "M/d/yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={fromDate}
                      defaultMonth={fromDate}
                      onSelect={(d) =>
                        setFilterState((s) => ({
                          ...s,
                          from: d ? format(d, "yyyy-MM-dd") : "",
                        }))
                      }
                      disabled={(d) => (toDate ? d > toDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Date to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-sm",
                        !toDate && "text-muted-foreground",
                      )}
                    >
                      <HugeiconsIcon
                        icon={Calendar01Icon}
                        className="mr-1 shrink-0"
                        size={14}
                      />
                      {toDate ? format(toDate, "M/d/yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={toDate}
                      defaultMonth={toDate}
                      onSelect={(d) =>
                        setFilterState((s) => ({
                          ...s,
                          to: d ? format(d, "yyyy-MM-dd") : "",
                        }))
                      }
                      disabled={(d) => (fromDate ? d < fromDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setFilterState({
                status: "",
                categoryId: "",
                from: "",
                to: "",
              });
            }}
          >
            Reset
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              pushParams({
                status: filterState.status,
                categoryId: filterState.categoryId,
                from: filterState.from,
                to: filterState.to,
                page: 0,
              });
              setIsFilterOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
