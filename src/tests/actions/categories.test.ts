import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeMockSession, makeMockShop } from "./setup";

type MockAuth = { user: { id: string } } | null;
type MockShop = { slug: string; ownerId: string } | null;
type SafeActionMiddlewareArgs = {
  next: (args: { ctx: Record<string, unknown> }) => Promise<unknown>;
  ctx: Record<string, unknown>;
};
type ShopOwnerMiddlewareArgs = SafeActionMiddlewareArgs & {
  bindArgsClientInputs: unknown[];
};
const {
  mockPrisma,
  PrismaError,
  setMockAuth,
  setMockShop,
  getMockAuth,
  getMockShop,
} = vi.hoisted(() => {
  let __auth: MockAuth = null;
  let __shop: MockShop = null;
  const mockPrisma = {
    category: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  };
  class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, opts: { code: string }) {
      super(message);
      this.name = "PrismaClientKnownRequestError";
      this.code = opts.code;
    }
  }
  return {
    mockPrisma,
    PrismaError: PrismaClientKnownRequestError,
    setMockAuth: (auth: MockAuth) => {
      __auth = auth;
    },
    setMockShop: (shop: MockShop) => {
      __shop = shop;
    },
    getMockAuth: () => __auth,
    getMockShop: () => __shop,
  };
});

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;push;/sign-in;303;",
    });
  }),
  notFound: vi.fn(() => {
    throw Object.assign(new Error("NEXT_NOT_FOUND"), {
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/safe-action", async () => {
  const { createSafeActionClient } = await import("next-safe-action");
  const { redirect } = await import("next/navigation");
  const z = await import("zod");
  const ac = createSafeActionClient({
    handleServerError: (e: unknown) => {
      if (e instanceof Error) return e.message;
      return "Something went wrong while executing the operation.";
    },
  });
  return {
    actionClient: ac,
    authClient: ac.use(async ({ next, ctx }: SafeActionMiddlewareArgs) => {
      const authData = getMockAuth();
      if (!authData) {
        redirect("/sign-in");
      }
      return next({ ctx: { ...ctx, auth: authData } });
    }),
    shopOwnerActionClient: ac
      .bindArgsSchemas([z.object({ shop: z.string() })])
      .use(
        async ({
          next,
          ctx,
          bindArgsClientInputs,
        }: ShopOwnerMiddlewareArgs) => {
          const [{ shop: shopSlug }] = bindArgsClientInputs;
          const shop = getMockShop();
          if (
            !shop ||
            shop.slug !== shopSlug ||
            shop.ownerId !== getMockAuth()?.user.id
          ) {
            throw new Error("Forbidden: you do not own this shop");
          }
          return next({ ctx: { ...ctx, shop } });
        },
      ),
  };
});

vi.mock("@/lib/prisma", () => ({ default: mockPrisma, prisma: mockPrisma }));

vi.mock("@/generated/prisma/client", () => ({
  Prisma: {
    PrismaClientKnownRequestError: PrismaError,
    Decimal: class {
      value: number;
      constructor(val: number) {
        this.value = val;
      }
      toNumber() {
        return this.value;
      }
    },
  },
}));

import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/features/dashboard-categories/actions";

const BIND = { shop: "my-shop" };
const makePrismaError = (code: string, msg = "DB error") =>
  new PrismaError(msg, { code });

beforeEach(() => {
  vi.clearAllMocks();
  setMockAuth(makeMockSession());
  setMockShop(makeMockShop());
});

describe("createCategory", () => {
  const validInput = {
    shopId: "test-shop-id",
    name: "Electronics",
    slug: "electronics",
  };

  it("creates a category", async () => {
    const created = { id: "cat-1", ...validInput, parentId: null };
    mockPrisma.category.create.mockResolvedValue(created);
    const result = await createCategory.bind(null, BIND)(validInput);
    expect(result.data?.category).toEqual(created);
  });

  it("returns validation errors for short name", async () => {
    const result = await createCategory.bind(
      null,
      BIND,
    )({ ...validInput, name: "A" });
    expect(result.validationErrors?.name?._errors).toBeDefined();
  });

  it("returns server error on duplicate slug", async () => {
    mockPrisma.category.create.mockRejectedValue(makePrismaError("P2002"));
    const result = await createCategory.bind(null, BIND)(validInput);
    expect(result.serverError).toBe(
      "A category with this slug already exists.",
    );
  });
});

describe("updateCategory", () => {
  const validInput = { id: "cat-1", name: "Updated", slug: "updated-category" };

  it("updates a category", async () => {
    mockPrisma.category.update.mockResolvedValue({
      id: "cat-1",
      name: "Updated",
      slug: "updated-category",
      parentId: null,
    });
    const result = await updateCategory.bind(null, BIND)(validInput);
    expect(result.data?.category.name).toBe("Updated");
  });

  it("returns server error when not found", async () => {
    mockPrisma.category.update.mockRejectedValue(makePrismaError("P2025"));
    const result = await updateCategory.bind(null, BIND)(validInput);
    expect(result.serverError).toBe("Category not found.");
  });
});

describe("deleteCategory", () => {
  it("deletes a category", async () => {
    mockPrisma.category.delete.mockResolvedValue({ id: "cat-1" });
    const result = await deleteCategory.bind(null, BIND)({ id: "cat-1" });
    expect(result.data).toEqual({ success: true });
  });
});
