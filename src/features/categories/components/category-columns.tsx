"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CategoryRowActions } from "./category-row-actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
}

function DrillDownCell({ row, level }: { row: CategoryRow; level: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (level >= 3 || row._count.children === 0) {
    return (
      <span className="text-muted-foreground text-sm">
        {row._count.children} sub
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
      {row._count.children} sub
      <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
    </Button>
  );
}

export function getCategoryColumns({
  page,
  pageSize,
  level,
}: GetCategoryColumnsParams): ColumnDef<CategoryRow>[] {
  return [
    {
      id: "serial",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {page * pageSize + row.index + 1}
        </span>
      ),
      size: 48,
    },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.slug}</span>
      ),
    },
    {
      id: "children",
      header: "Subcategories",
      cell: ({ row }) => <DrillDownCell row={row.original} level={level} />,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
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
