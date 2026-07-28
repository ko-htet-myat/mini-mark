import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeMockSession, makeMockShop } from "./setup";

type MockAuth = { user: { id: string } } | null;
type MockShop = { slug: string; ownerId: string } | null;
type SafeActionMiddlewareArgs = {
  next: (args: { ctx: Record<string, unknown> }) => unknown;
  ctx: Record<string, unknown>;
};
type ShopOwnerMiddlewareArgs = SafeActionMiddlewareArgs & {
  bindArgsClientInputs: [{ shop: string }];
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
    attribute: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    attributeValue: { findMany: vi.fn() },
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
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "@/features/dashboard-attributes/actions";

const BIND = { shop: "my-shop" };
const makePrismaError = (code: string, msg = "DB error") =>
  new PrismaError(msg, { code });

beforeEach(() => {
  vi.clearAllMocks();
  setMockAuth(makeMockSession());
  setMockShop(makeMockShop());
});

describe("createAttribute", () => {
  const validInput = {
    shopId: "test-shop-id",
    name: "Size",
    slug: "size",
    values: ["S", "M", "L"],
  };

  it("creates an attribute with values", async () => {
    const created = { id: "attr-1", name: "Size", slug: "size" };
    mockPrisma.attribute.create.mockResolvedValue(created);
    const result = await createAttribute.bind(null, BIND)(validInput);
    expect(result.data?.attribute).toEqual(created);
    expect(mockPrisma.attribute.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          values: { create: [{ value: "S" }, { value: "M" }, { value: "L" }] },
        }),
      }),
    );
  });

  it("returns validation errors when no values provided", async () => {
    const result = await createAttribute.bind(
      null,
      BIND,
    )({ ...validInput, values: [] });
    expect(result.validationErrors?.values?._errors).toBeDefined();
  });

  it("returns server error on duplicate slug", async () => {
    mockPrisma.attribute.create.mockRejectedValue(makePrismaError("P2002"));
    const result = await createAttribute.bind(null, BIND)(validInput);
    expect(result.serverError).toBe(
      "An attribute with this slug or value already exists.",
    );
  });
});

describe("updateAttribute", () => {
  const existingValues = [
    { id: "val-1", value: "S", attributeId: "attr-1" },
    { id: "val-2", value: "M", attributeId: "attr-1" },
    { id: "val-3", value: "L", attributeId: "attr-1" },
  ];
  const validInput = {
    id: "attr-1",
    name: "Size",
    slug: "size",
    values: ["S", "M", "L", "XL"],
  };

  it("adds new values and keeps existing ones", async () => {
    mockPrisma.attributeValue.findMany.mockResolvedValue(existingValues);
    mockPrisma.attribute.update.mockResolvedValue({
      id: "attr-1",
      name: "Size",
      slug: "size",
    });
    const result = await updateAttribute.bind(null, BIND)(validInput);
    expect(result.data?.attribute).toBeDefined();
    expect(mockPrisma.attribute.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          values: { create: [{ value: "XL" }], deleteMany: { id: { in: [] } } },
        }),
      }),
    );
  });

  it("removes values not in the new set", async () => {
    mockPrisma.attributeValue.findMany.mockResolvedValue(existingValues);
    mockPrisma.attribute.update.mockResolvedValue({
      id: "attr-1",
      name: "Size",
      slug: "size",
    });
    await updateAttribute.bind(
      null,
      BIND,
    )({ ...validInput, values: ["S", "M"] });
    expect(mockPrisma.attribute.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          values: { create: [], deleteMany: { id: { in: ["val-3"] } } },
        }),
      }),
    );
  });

  it("returns server error when not found", async () => {
    mockPrisma.attributeValue.findMany.mockResolvedValue(existingValues);
    mockPrisma.attribute.update.mockRejectedValue(makePrismaError("P2025"));
    const result = await updateAttribute.bind(null, BIND)(validInput);
    expect(result.serverError).toBe("Attribute not found.");
  });
});

describe("deleteAttribute", () => {
  it("deletes an attribute", async () => {
    mockPrisma.attribute.delete.mockResolvedValue({ id: "attr-1" });
    const result = await deleteAttribute.bind(null, BIND)({ id: "attr-1" });
    expect(result.data).toEqual({ success: true });
  });
});
