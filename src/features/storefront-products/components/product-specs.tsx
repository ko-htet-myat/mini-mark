import { cn } from "@/lib/utils";

interface ProductSpecsProps {
  specifications: Record<string, string>;
  className?: string;
}

/**
 * Read-only key-value specification table for the storefront product detail page.
 * Shown for: ELECTRONICS, AUTOMOTIVE, HOME_GARDEN, BEAUTY shops.
 */
export function ProductSpecs({ specifications, className }: ProductSpecsProps) {
  const entries = Object.entries(specifications);
  if (entries.length === 0) return null;

  return (
    <div className={cn("", className)}>
      <h2 className="mb-3 text-lg font-semibold text-foreground">
        Specifications
      </h2>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <tbody>
            {entries.map(([key, value], i) => (
              <tr
                key={key}
                className={cn(
                  "flex",
                  i % 2 === 0 ? "bg-muted/40" : "bg-background",
                )}
              >
                <td className="w-2/5 shrink-0 px-4 py-2.5 font-medium text-foreground">
                  {key}
                </td>
                <td className="flex-1 px-4 py-2.5 text-muted-foreground">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
