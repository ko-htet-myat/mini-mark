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
    promotion: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
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
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "@/features/dashboard-promotions/actions";

const BIND = { shop: "my-shop" };
const makePrismaError = (code: string, msg = "DB error") =>
  new PrismaError(msg, { code });

beforeEach(() => {
  vi.clearAllMocks();
  setMockAuth(makeMockSession());
  setMockShop(makeMockShop());
});

describe("createPromotion", () => {
  const validInput = {
    shopId: "test-shop-id",
    name: "Summer Sale",
    slug: "summer-sale",
    discountType: "PERCENTAGE" as const,
    discountValue: 20,
  };

  it("creates a promotion", async () => {
    const created = {
      id: "promo-1",
      name: "Summer Sale",
      slug: "summer-sale",
      discountType: "PERCENTAGE",
      discountValue: { toNumber: () => 20 },
    };
    mockPrisma.promotion.create.mockResolvedValue(created);
    const result = await createPromotion.bind(null, BIND)(validInput);
    expect(result.data?.promotion.discountValue).toBe(20);
  });

  it("returns validation errors for negative discount", async () => {
    const result = await createPromotion.bind(
      null,
      BIND,
    )({ ...validInput, discountValue: -5 });
    expect(result.validationErrors?.discountValue?._errors).toBeDefined();
  });

  it("returns server error on duplicate slug", async () => {
    mockPrisma.promotion.create.mockRejectedValue(makePrismaError("P2002"));
    const result = await createPromotion.bind(null, BIND)(validInput);
    expect(result.serverError).toBe(
      "A promotion with this slug or code already exists.",
    );
  });
});

describe("updatePromotion", () => {
  const validInput = {
    id: "promo-1",
    name: "Winter Sale",
    slug: "winter-sale",
    discountType: "PERCENTAGE" as const,
    discountValue: 30,
  };

  it("updates a promotion", async () => {
    const updated = {
      id: "promo-1",
      name: "Winter Sale",
      slug: "winter-sale",
      discountType: "PERCENTAGE",
      discountValue: { toNumber: () => 30 },
    };
    mockPrisma.promotion.update.mockResolvedValue(updated);
    const result = await updatePromotion.bind(null, BIND)(validInput);
    expect(result.data?.promotion.discountValue).toBe(30);
  });

  it("returns server error when not found", async () => {
    mockPrisma.promotion.update.mockRejectedValue(makePrismaError("P2025"));
    const result = await updatePromotion.bind(null, BIND)(validInput);
    expect(result.serverError).toBe("Promotion not found.");
  });
});

describe("deletePromotion", () => {
  it("deletes a promotion", async () => {
    mockPrisma.promotion.delete.mockResolvedValue({ id: "promo-1" });
    const result = await deletePromotion.bind(null, BIND)({ id: "promo-1" });
    expect(result.data).toEqual({ success: true });
  });
});
