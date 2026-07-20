import { prisma } from "@/lib/prisma";

interface GetCategoriesParams {
  shopId: string;
  page: number; // 0-indexed
  pageSize: number;
  nameFilter?: string;
  parentId?: string | null; // null = root level, string = children of that parent
}

/**
 * Returns a paginated page of categories at a specific level.
 * - parentId === null  → Level 1 (root categories)
 * - parentId === "id"  → Level 2 or 3 (children of that parent)
 */
export async function getCategoriesPage({
  shopId,
  page,
  pageSize,
  nameFilter,
  parentId,
}: GetCategoriesParams) {
  const where = {
    shopId,
    parentId: parentId ?? null,
    ...(nameFilter
      ? { name: { contains: nameFilter, mode: "insensitive" as const } }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: page * pageSize,
      take: pageSize,
      include: {
        _count: { select: { children: true } },
      },
    }),
    prisma.category.count({ where }),
  ]);

  return { data, total, pageCount: Math.ceil(total / pageSize) };
}

/**
 * Resolves a breadcrumb trail from root to the given categoryId.
 * Returns an ordered array [Level1, Level2?, Level3?].
 */
export async function getCategoryBreadcrumb(categoryId: string) {
  const trail: { id: string; name: string }[] = [];
  let current: { id: string; name: string; parentId: string | null } | null =
    await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, parentId: true },
    });

  while (current) {
    trail.unshift({ id: current.id, name: current.name });
    if (!current.parentId) break;
    current = await prisma.category.findUnique({
      where: { id: current.parentId },
      select: { id: true, name: true, parentId: true },
    });
  }

  return trail;
}

/**
 * Returns the depth (1, 2, or 3) of a category by walking up the tree.
 */
export async function getCategoryDepth(categoryId: string): Promise<number> {
  let depth = 1;
  let parentId: string | null = null;

  const cat = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { parentId: true },
  });

  if (!cat) return 1;
  parentId = cat.parentId;

  while (parentId) {
    depth++;
    const parent = await prisma.category.findUnique({
      where: { id: parentId },
      select: { parentId: true },
    });
    parentId = parent?.parentId ?? null;
  }

  return depth;
}

/**
 * Returns a flat list of all Level 1 categories for a parent picker dropdown.
 */
export async function getLevelOneCategories(shopId: string) {
  return prisma.category.findMany({
    where: { shopId, parentId: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Returns a flat list of all Level 2 categories (children of any L1) for a dropdown.
 */
export async function getLevelTwoCategories(shopId: string) {
  return prisma.category.findMany({
    where: {
      shopId,
      parentId: { not: null },
      parent: { parentId: null },
    },
    select: {
      id: true,
      name: true,
      parentId: true,
      parent: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Returns all valid parent categories (Level 1 and Level 2).
 * L3 cannot be parents as max depth is 3.
 */
export async function getAllPotentialParents(shopId: string) {
  return prisma.category.findMany({
    where: {
      shopId,
      OR: [{ parentId: null }, { parent: { parentId: null } }],
    },
    select: {
      id: true,
      name: true,
      parentId: true,
      parent: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
}
