"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterOption = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  count: number;
};

type ProductFilterSelectProps = {
  shopSlug: string;
  label: string;
  paramKey: "category" | "brand";
  otherParams: Record<string, string | undefined>;
  options: FilterOption[];
  activeValue?: string;
  allLabel: string;
};

export function ProductFilterSelect({
  shopSlug,
  label,
  paramKey,
  otherParams,
  options,
  activeValue,
  allLabel,
}: ProductFilterSelectProps) {
  const router = useRouter();

  function handleValueChange(value: string) {
    const params = new URLSearchParams();
    if (value !== "all") {
      params.set(paramKey, value);
    }
    for (const [key, paramValue] of Object.entries(otherParams)) {
      if (paramValue) {
        params.set(key, paramValue);
      }
    }
    const query = params.toString();
    router.push(`/${shopSlug}/products${query ? `?${query}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <Select value={activeValue ?? "all"} onValueChange={handleValueChange}>
        <SelectTrigger className=" w-35 sm:w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">{allLabel}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.slug}>
                {option.imageUrl && (
                  <span className="relative h-4 w-4 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={option.imageUrl}
                      alt=""
                      fill
                      sizes="16px"
                      className="object-cover"
                    />
                  </span>
                )}
                <span className="line-clamp-1">{option.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {option.count}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
