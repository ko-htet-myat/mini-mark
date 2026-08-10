import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeMockSession } from "./setup";

type MockAuth = { user: { id: string } } | null;
type SafeActionMiddlewareArgs = {
  next: (args: { ctx: Record<string, unknown> }) => Promise<unknown>;
  ctx: Record<string, unknown>;
};
const { mockGetSession, mockPrisma, setMockAuth, getMockAuth } = vi.hoisted(
  () => {
    let __auth: MockAuth = null;
    const _mockPrisma = {
      shop: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
      shopOperatingHours: { upsert: vi.fn() },
      auditLog: { create: vi.fn() },
      $transaction: vi.fn(),
    };
    _mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: typeof _mockPrisma) => unknown) => cb(_mockPrisma),
    );

    return {
      mockGetSession: vi.fn(),
      mockPrisma: _mockPrisma,
      setMockAuth: (auth: MockAuth) => {
        __auth = auth;
      },
      getMockAuth: () => __auth,
    };
  },
);

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), {
      digest: `NEXT_REDIRECT;push;${url};303;`,
    });
  }),
  notFound: vi.fn(() => {
    throw Object.assign(new Error("NEXT_NOT_FOUND"), {
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
  }),
}));

vi.mock("@/lib/safe-action", async () => {
  const { createSafeActionClient } = await import("next-safe-action");
  const { redirect } = await import("next/navigation");
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
  };
});

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/get-session", () => ({
  getSession: mockGetSession,
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

import { createShopAction } from "@/features/shop/actions/shop";
import { updateShopAction } from "@/features/shop/actions/edit";

beforeEach(() => {
  vi.clearAllMocks();
  setMockAuth(makeMockSession());
});

describe("createShopAction", () => {
  const validInput = {
    name: "My Shop",
    slug: "my-shop",
    currency: "MMK" as const,
    shopCategory: "FASHION" as const,
  };

  it("creates a shop and returns it", async () => {
    mockGetSession.mockResolvedValue(makeMockSession());
    mockPrisma.shop.findUnique.mockResolvedValue(null);
    const created = {
      id: "new-shop-id",
      name: "My Shop",
      slug: "my-shop",
      currency: "MMK",
      ownerId: "test-user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.shop.create.mockResolvedValue(created);

    const result = await createShopAction(validInput);

    expect(result.data?.shop).toBeDefined();
    expect(result.data?.shop.name).toBe("My Shop");
    expect(result.serverError).toBeUndefined();
  });

  it("returns validation errors for short name", async () => {
    const result = await createShopAction({ ...validInput, name: "X" });
    expect(result.validationErrors?.name?._errors).toBeDefined();
  });

  it("returns validation errors for invalid slug format", async () => {
    const result = await createShopAction({ ...validInput, slug: "MY_SHOP" });
    expect(result.validationErrors?.slug?._errors).toBeDefined();
  });

  it("returns server error when user already has a shop", async () => {
    mockGetSession.mockResolvedValue(makeMockSession());
    mockPrisma.shop.findUnique.mockResolvedValueOnce({ id: "existing-shop" });

    const result = await createShopAction(validInput);
    expect(result.serverError).toBe("You already have a shop");
  });

  it("returns field-level validation error when slug is taken", async () => {
    mockGetSession.mockResolvedValue(makeMockSession());
    mockPrisma.shop.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "other-shop" });

    const result = await createShopAction(validInput);
    expect(result.validationErrors?.slug?._errors).toContain(
      "This shop URL is already taken",
    );
  });

  it("redirects when unauthenticated", async () => {
    setMockAuth(null);
    mockGetSession.mockResolvedValue(null);
    await expect(createShopAction(validInput)).rejects.toThrow("NEXT_REDIRECT");
  });
});

describe("updateShopAction", () => {
  const validInput = {
    name: "Updated Shop",
    currency: "USD" as const,
    shopCategory: "FASHION" as const,
    description: "A great shop",
    contactPhones: [],
    region: "Yangon Region",
    division: "Yangon East District",
    township: "Thingangyun Township",
    address: "No. 12, Main Road",
    operatingHours: [
      {
        dayOfWeek: "MONDAY" as const,
        isClosed: false,
        openTime: "09:00",
        closeTime: "18:00",
      },
      {
        dayOfWeek: "TUESDAY" as const,
        isClosed: true,
        openTime: "",
        closeTime: "",
      },
    ],
  };
  const mockShop = {
    id: "shop-1",
    ownerId: "test-user-id",
    name: "Original",
    slug: "my-shop",
    currency: "MMK",
    description: null,
    contactEmail: null,
    contactPhones: [],
    logoUrl: null,
    bannerUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("updates and returns the shop", async () => {
    mockGetSession.mockResolvedValue(makeMockSession());
    mockPrisma.shop.findUnique.mockResolvedValue(mockShop);
    mockPrisma.shop.update.mockResolvedValue({
      ...mockShop,
      name: "Updated Shop",
    });

    const result = await updateShopAction(validInput);
    expect(result.data?.shop.name).toBe("Updated Shop");
    expect(result.serverError).toBeUndefined();
  });

  it("persists contact location fields", async () => {
    mockGetSession.mockResolvedValue(makeMockSession());
    mockPrisma.shop.findUnique.mockResolvedValue(mockShop);
    mockPrisma.shop.update.mockResolvedValue({
      ...mockShop,
      ...validInput,
    });

    await updateShopAction(validInput);

    expect(mockPrisma.shop.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          region: "Yangon Region",
          division: "Yangon East District",
          township: "Thingangyun Township",
          address: "No. 12, Main Road",
        }),
      }),
    );
  });

  it("upserts shop operating hours", async () => {
    mockGetSession.mockResolvedValue(makeMockSession());
    mockPrisma.shop.findUnique.mockResolvedValue(mockShop);
    mockPrisma.shop.update.mockResolvedValue({
      ...mockShop,
      ...validInput,
    });
    mockPrisma.shopOperatingHours.upsert.mockResolvedValue({});

    await updateShopAction(validInput);

    expect(mockPrisma.shopOperatingHours.upsert).toHaveBeenCalledWith({
      where: {
        shopId_dayOfWeek: {
          shopId: "shop-1",
          dayOfWeek: "MONDAY",
        },
      },
      create: {
        shopId: "shop-1",
        dayOfWeek: "MONDAY",
        isClosed: false,
        openTime: "09:00",
        closeTime: "18:00",
      },
      update: {
        isClosed: false,
        openTime: "09:00",
        closeTime: "18:00",
      },
    });
    expect(mockPrisma.shopOperatingHours.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          shopId_dayOfWeek: {
            shopId: "shop-1",
            dayOfWeek: "TUESDAY",
          },
        },
        create: expect.objectContaining({
          isClosed: true,
          openTime: null,
          closeTime: null,
        }),
        update: {
          isClosed: true,
          openTime: null,
          closeTime: null,
        },
      }),
    );
  });

  it("returns validation errors for invalid currency", async () => {
    const result = await updateShopAction({
      ...validInput,
      currency: "INVALID" as never,
    });
    expect(result.validationErrors?.currency?._errors).toBeDefined();
  });

  it("returns server error when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await updateShopAction(validInput);
    expect(result.serverError).toBe("Not authenticated");
  });

  it("returns server error when shop not found", async () => {
    mockGetSession.mockResolvedValue(makeMockSession());
    mockPrisma.shop.findUnique.mockResolvedValue(null);
    const result = await updateShopAction(validInput);
    expect(result.serverError).toBe("Shop not found");
  });
});
