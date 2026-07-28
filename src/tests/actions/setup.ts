import type { Session, User } from "better-auth";

export const makeMockUser = (overrides?: Partial<User>): User => ({
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  emailVerified: true,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const makeMockSession = (
  userOverrides?: Partial<User>,
): { user: User; session: Session } => ({
  user: makeMockUser(userOverrides),
  session: {
    id: "test-session-id",
    userId: "test-user-id",
    expiresAt: new Date(Date.now() + 86400000),
    token: "test-token",
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: null,
    userAgent: null,
  },
});

export const makeMockShop = (overrides?: Record<string, unknown>) => ({
  id: "test-shop-id",
  slug: "my-shop",
  name: "My Shop",
  description: null,
  logoUrl: null,
  bannerUrl: null,
  contactEmail: null,
  currency: "MMK" as const,
  contactPhones: [],
  ownerId: "test-user-id",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
