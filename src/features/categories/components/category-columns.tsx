"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CategoryRowActions } from "./category-row-actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  _count: { children: number };
};

interface GetCategoryColumnsParams {
  page: number;
  pageSize: number;
  /** Current depth level: 1, 2, or 3 */
  level: number;
  tc: {
    serial: string;
    name: string;
    slug: string;
    subcategories: string;
    created: string;
  };
}

function DrillDownCell({ row, level }: { row: CategoryRow; level: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tc = useTranslations("Common");
  const tc2 = useTranslations("Categories");

  if (level >= 3 || row._count.children === 0) {
    return (
      <span className="text-muted-foreground text-sm">
        {tc2("sub_count", { count: row._count.children })}
      </span>
    );
  }

  function handleDrillDown() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("parentId", row.id);
    params.delete("page");
    params.delete("name");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1 text-xs"
      onClick={handleDrillDown}
    >
      {tc2("sub_count", { count: row._count.children })}
      <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
    </Button>
  );
}

export function getCategoryColumns({
  page,
  pageSize,
  level,
  tc,
}: GetCategoryColumnsParams): ColumnDef<CategoryRow>[] {
  return [
    {
      id: "serial",
      header: tc.serial,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {page * pageSize + row.index + 1}
        </span>
      ),
      size: 48,
    },
    { accessorKey: "name", header: tc.name },
    {
      accessorKey: "slug",
      header: tc.slug,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.slug}</span>
      ),
    },
    {
      id: "children",
      header: tc.subcategories,
      cell: ({ row }) => <DrillDownCell row={row.original} level={level} />,
    },
    {
      accessorKey: "createdAt",
      header: tc.created,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <CategoryRowActions
          categoryId={row.original.id}
          categoryName={row.original.name}
          level={level}
        />
      ),
    },
  ];
}
