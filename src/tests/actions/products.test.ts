import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeMockSession, makeMockShop } from "./setup";

type MockAuth = { user: { id: string } } | null;
type MockShop = {
  id: string;
  slug: string;
  ownerId: string;
  shopCategory: string;
} | null;
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
    product: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    productVariant: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
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
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  duplicateProduct,
} from "@/features/dashboard-products/actions";

const BIND = { shop: "my-shop" };
const makePrismaError = (code: string, msg = "DB error") =>
  new PrismaError(msg, { code });

const makeMockDecimal = (val: number) => ({
  toNumber: () => val,
  valueOf: () => val,
});

const baseProduct = {
  id: "prod-1",
  shopId: "test-shop-id",
  name: "Test Product",
  slug: "test-product",
  description: null,
  price: makeMockDecimal(29.99),
  compareAtPrice: null,
  costPrice: null,
  imageUrl: null,
  youtubeUrl: null,
  noticeText: null,
  isActive: true,
  isFeatured: false,
  isBestSellerItem: false,
  isCollection: false,
  isSpecialMenu: false,
  metaTitle: null,
  metaDescription: null,
  hasVariants: false,
  uom: "PCS",
  barcode: null,
  minOrderQuantity: null,
  maxOrderQuantity: null,
  isOutOfStock: false,
  categoryId: null,
  brandId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  setMockAuth(makeMockSession());
  setMockShop({
    ...makeMockShop(),
    shopCategory: "FASHION",
  });
  mockPrisma.$transaction.mockImplementation(
    (cb: (tx: typeof mockPrisma) => unknown) => cb(mockPrisma),
  );
});

describe("createProduct", () => {
  const validInput = {
    shopId: "test-shop-id",
    basicInfo: {
      name: "New Product",
      slug: "new-product",
      description: "",
      categoryId: "",
      brandId: "",
      imageUrl: "",
      youtubeUrl: "",
    },
    pricingInventory: {
      price: 19.99,
      uom: "PCS" as const,
      isOutOfStock: false,
    },
    categoryEngine: {
      shopCategory: "FASHION",
      hasVariants: false,
      variants: [],
      selectedAttributeIds: [],
      specifications: {},
      addons: [],
    },
    merchandisingSeo: {
      isActive: true,
      isFeatured: false,
      isBestSellerItem: false,
      isCollection: false,
      isSpecialMenu: false,
      noticeText: "",
      metaTitle: "",
      metaDescription: "",
    },
  };

  it("creates a simple product (no variants)", async () => {
    mockPrisma.product.create.mockResolvedValue(baseProduct);
    const result = await createProduct.bind(null, BIND)(validInput);
    expect(result.data?.product.name).toBe("Test Product");
    expect(result.data?.product.price).toBe(29.99);
    expect(result.serverError).toBeUndefined();
  });

  it("persists product merchandising and SEO fields", async () => {
    mockPrisma.product.create.mockResolvedValue({
      ...baseProduct,
      costPrice: makeMockDecimal(12.5),
      isFeatured: true,
      noticeText: "Ships in 3 days",
      metaTitle: "New Product SEO",
      metaDescription: "Short search preview.",
    });
    const result = await createProduct.bind(
      null,
      BIND,
    )({
      ...validInput,
      pricingInventory: {
        ...validInput.pricingInventory,
        costPrice: 12.5,
        barcode: "123456789",
        minOrderQuantity: 2,
        maxOrderQuantity: 10,
        isOutOfStock: true,
      },
      merchandisingSeo: {
        ...validInput.merchandisingSeo,
        isFeatured: true,
        isBestSellerItem: true,
        isCollection: true,
        noticeText: "Ships in 3 days",
        metaTitle: "New Product SEO",
        metaDescription: "Short search preview.",
      },
    });
    expect(result.data?.product.costPrice).toBe(12.5);
    expect(result.data?.product.isFeatured).toBe(true);
    expect(mockPrisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          costPrice: 12.5,
          barcode: "123456789",
          minOrderQuantity: 2,
          maxOrderQuantity: 10,
          isOutOfStock: true,
          isFeatured: true,
          isBestSellerItem: true,
          isCollection: true,
          noticeText: "Ships in 3 days",
          metaTitle: "New Product SEO",
          metaDescription: "Short search preview.",
        }),
      }),
    );
  });

  it("creates a product with variants", async () => {
    mockPrisma.product.create.mockResolvedValue({
      ...baseProduct,
      hasVariants: true,
    });
    const result = await createProduct.bind(
      null,
      BIND,
    )({
      ...validInput,
      categoryEngine: {
        ...validInput.categoryEngine,
        hasVariants: true,
        variants: [
          {
            sku: "NP-RED",
            price: 24.99,
            compareAtPrice: 29.99,
            costPrice: 12.5,
            stock: 10,
            allowBackorder: true,
            uom: "G" as const,
            uomValue: 500,
            imageUrl: "",
            isActive: true,
            attributeValueIds: ["av-1"],
          },
        ],
      },
    });
    expect(result.data?.product.hasVariants).toBe(true);
    expect(mockPrisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          variants: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                sku: "NP-RED",
                stock: 10,
                compareAtPrice: 29.99,
                costPrice: 12.5,
                allowBackorder: true,
                uom: "G",
                uomValue: 500,
                attributeValues: {
                  create: [{ attributeValueId: "av-1" }],
                },
              }),
            ]),
          }),
        }),
      }),
    );
  });

  it("returns validation errors for short name", async () => {
    const result = await createProduct.bind(
      null,
      BIND,
    )({
      ...validInput,
      basicInfo: { ...validInput.basicInfo, name: "X" },
    });
    expect(result.validationErrors?.basicInfo?.name?._errors).toBeDefined();
  });

  it("returns server error on duplicate slug", async () => {
    mockPrisma.product.create.mockRejectedValue(makePrismaError("P2002"));
    const result = await createProduct.bind(null, BIND)(validInput);
    expect(result.serverError).toBe("A product with this slug already exists.");
  });
});

describe("updateProduct", () => {
  const validInput = {
    id: "prod-1",
    shopId: "test-shop-id",
    basicInfo: {
      name: "Updated",
      slug: "updated-product",
      description: "",
      categoryId: "",
      brandId: "",
      imageUrl: "",
      youtubeUrl: "",
    },
    pricingInventory: {
      price: 39.99,
      uom: "PCS" as const,
      isOutOfStock: false,
    },
    categoryEngine: {
      shopCategory: "FASHION",
      hasVariants: false,
      variants: [],
      selectedAttributeIds: [],
      specifications: {},
      addons: [],
    },
    merchandisingSeo: {
      isActive: true,
      isFeatured: false,
      isBestSellerItem: false,
      isCollection: false,
      isSpecialMenu: false,
      noticeText: "",
      metaTitle: "",
      metaDescription: "",
    },
  };

  it("updates a product", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({ shopId: "test-shop-id" });
    mockPrisma.productVariant.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.product.update.mockResolvedValue({
      ...baseProduct,
      name: "Updated",
      price: makeMockDecimal(39.99),
    });
    const result = await updateProduct.bind(null, BIND)(validInput);
    expect(result.data?.product.name).toBe("Updated");
    expect(result.data?.product.price).toBe(39.99);
  });

  it("updates product merchandising and SEO fields", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({ shopId: "test-shop-id" });
    mockPrisma.productVariant.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.product.update.mockResolvedValue({
      ...baseProduct,
      costPrice: makeMockDecimal(18),
      isFeatured: true,
      noticeText: "Limited stock",
      metaTitle: "Updated SEO",
      metaDescription: "Updated preview.",
    });
    const result = await updateProduct.bind(
      null,
      BIND,
    )({
      ...validInput,
      pricingInventory: {
        ...validInput.pricingInventory,
        costPrice: 18,
        barcode: "987654321",
        minOrderQuantity: 1,
        maxOrderQuantity: 5,
      },
      merchandisingSeo: {
        ...validInput.merchandisingSeo,
        isFeatured: true,
        isBestSellerItem: true,
        noticeText: "Limited stock",
        metaTitle: "Updated SEO",
        metaDescription: "Updated preview.",
      },
    });
    expect(result.data?.product.costPrice).toBe(18);
    expect(result.data?.product.isFeatured).toBe(true);
    expect(mockPrisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          costPrice: 18,
          barcode: "987654321",
          minOrderQuantity: 1,
          maxOrderQuantity: 5,
          isFeatured: true,
          isBestSellerItem: true,
          noticeText: "Limited stock",
          metaTitle: "Updated SEO",
          metaDescription: "Updated preview.",
        }),
      }),
    );
  });

  it("syncs variants during update", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({ shopId: "test-shop-id" });
    mockPrisma.productVariant.deleteMany.mockResolvedValue({ count: 2 });
    mockPrisma.product.update.mockResolvedValue({
      ...baseProduct,
      hasVariants: true,
    });
    const result = await updateProduct.bind(
      null,
      BIND,
    )({
      ...validInput,
      categoryEngine: {
        ...validInput.categoryEngine,
        hasVariants: true,
        variants: [
          {
            sku: "UP-BLUE",
            price: 34.99,
            costPrice: 20,
            stock: 5,
            allowBackorder: false,
            imageUrl: "",
            isActive: true,
            attributeValueIds: [],
          },
        ],
      },
    });
    expect(result.data?.product.hasVariants).toBe(true);
    expect(mockPrisma.productVariant.deleteMany).toHaveBeenCalledWith({
      where: { productId: "prod-1" },
    });
  });

  it("returns server error on duplicate slug", async () => {
    mockPrisma.$transaction.mockRejectedValue(makePrismaError("P2002"));
    const result = await updateProduct.bind(null, BIND)(validInput);
    expect(result.serverError).toBe("A product with this slug already exists.");
  });

  it("returns server error when product not found", async () => {
    mockPrisma.$transaction.mockRejectedValue(makePrismaError("P2025"));
    const result = await updateProduct.bind(null, BIND)(validInput);
    expect(result.serverError).toBe("Product not found.");
  });
});

describe("deleteProduct", () => {
  it("deletes a product", async () => {
    mockPrisma.product.delete.mockResolvedValue(baseProduct);
    const result = await deleteProduct.bind(null, BIND)({ id: "prod-1" });
    expect(result.data).toEqual({ success: true });
    expect(mockPrisma.product.delete).toHaveBeenCalledWith({
      where: { id: "prod-1", shopId: "test-shop-id" },
    });
  });

  it("returns server error when not found", async () => {
    mockPrisma.product.delete.mockRejectedValue(makePrismaError("P2025"));
    const result = await deleteProduct.bind(null, BIND)({ id: "prod-1" });
    expect(result.serverError).toBe("Product not found.");
  });
});

describe("toggleProductStatus", () => {
  it("toggles product active status", async () => {
    mockPrisma.product.update.mockResolvedValue({
      ...baseProduct,
      isActive: false,
    });
    const result = await toggleProductStatus.bind(
      null,
      BIND,
    )({ id: "prod-1", isActive: false });
    expect(result.data?.product.isActive).toBe(false);
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: "prod-1", shopId: "test-shop-id" },
      data: { isActive: false },
    });
  });

  it("returns server error when not found", async () => {
    mockPrisma.product.update.mockRejectedValue(makePrismaError("P2025"));
    const result = await toggleProductStatus.bind(
      null,
      BIND,
    )({ id: "prod-1", isActive: true });
    expect(result.serverError).toBe("Product not found.");
  });
});

describe("duplicateProduct", () => {
  const original = { ...baseProduct, variants: [], promotions: [] };

  it("duplicates a simple product", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(original);
    mockPrisma.product.create.mockResolvedValue({
      ...baseProduct,
      id: "dup-1",
      slug: "test-product-copy-1234",
      name: "Test Product (Copy)",
    });
    const result = await duplicateProduct.bind(null, BIND)({ id: "prod-1" });
    expect(result.data?.success).toBe(true);
    expect(result.data?.newProductId).toBe("dup-1");
    expect(mockPrisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isActive: false,
          name: expect.stringContaining("(Copy)"),
          slug: expect.stringContaining("-copy-"),
        }),
      }),
    );
  });

  it("duplicates with variants and promotions", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      ...original,
      hasVariants: true,
      variants: [
        {
          sku: "OG-SKU",
          price: makeMockDecimal(15),
          compareAtPrice: null,
          costPrice: makeMockDecimal(8),
          stock: 10,
          imageUrl: null,
          allowBackorder: true,
          uom: "G",
          uomValue: makeMockDecimal(500),
          isActive: true,
          attributeValues: [{ attributeValueId: "av-1" }],
        },
      ],
      promotions: [{ id: "promo-1" }],
    });
    mockPrisma.product.create.mockResolvedValue({
      ...baseProduct,
      id: "dup-2",
    });
    const result = await duplicateProduct.bind(null, BIND)({ id: "prod-1" });
    expect(result.data?.success).toBe(true);
    expect(mockPrisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          variants: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                sku: expect.stringContaining("-copy-"),
                costPrice: 8,
                allowBackorder: true,
                uom: "G",
                uomValue: 500,
              }),
            ]),
          }),
          promotions: { connect: [{ id: "promo-1" }] },
        }),
      }),
    );
  });

  it("returns server error when original not found", async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);
    const result = await duplicateProduct.bind(null, BIND)({ id: "prod-1" });
    expect(result.serverError).toBe("Product not found");
  });
});
