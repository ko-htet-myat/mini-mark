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
    brand: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
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
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/features/dashboard-brands/actions";

const BIND = { shop: "my-shop" };
const makePrismaError = (code: string, msg = "DB error") =>
  new PrismaError(msg, { code });

beforeEach(() => {
  vi.clearAllMocks();
  setMockAuth(makeMockSession());
  setMockShop(makeMockShop());
});

describe("createBrand", () => {
  const validInput = { shopId: "test-shop-id", name: "Nike", slug: "nike" };

  it("creates a brand", async () => {
    const created = { id: "brand-1", ...validInput };
    mockPrisma.brand.create.mockResolvedValue(created);
    const result = await createBrand.bind(null, BIND)(validInput);
    expect(result.data?.brand).toEqual(created);
  });

  it("returns validation errors for short name", async () => {
    const result = await createBrand.bind(
      null,
      BIND,
    )({ ...validInput, name: "X" });
    expect(result.validationErrors?.name?._errors).toBeDefined();
  });

  it("returns server error on duplicate slug", async () => {
    mockPrisma.brand.create.mockRejectedValue(makePrismaError("P2002"));
    const result = await createBrand.bind(null, BIND)(validInput);
    expect(result.serverError).toBe("A brand with this slug already exists.");
  });
});

describe("updateBrand", () => {
  const validInput = { id: "brand-1", name: "Adidas", slug: "adidas" };

  it("updates a brand", async () => {
    mockPrisma.brand.update.mockResolvedValue({
      id: "brand-1",
      name: "Adidas",
      slug: "adidas",
    });
    const result = await updateBrand.bind(null, BIND)(validInput);
    expect(result.data?.brand.name).toBe("Adidas");
  });

  it("returns server error when not found", async () => {
    mockPrisma.brand.update.mockRejectedValue(makePrismaError("P2025"));
    const result = await updateBrand.bind(null, BIND)(validInput);
    expect(result.serverError).toBe("Brand not found.");
  });
});

describe("deleteBrand", () => {
  it("deletes a brand", async () => {
    mockPrisma.brand.delete.mockResolvedValue({ id: "brand-1" });
    const result = await deleteBrand.bind(null, BIND)({ id: "brand-1" });
    expect(result.data).toEqual({ success: true });
  });
});
