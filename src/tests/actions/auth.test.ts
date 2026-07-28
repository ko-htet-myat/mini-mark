import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSignUpEmail, mockSignInEmail, mockPrisma } = vi.hoisted(() => ({
  mockSignUpEmail: vi.fn(),
  mockSignInEmail: vi.fn(),
  mockPrisma: { shop: { findUnique: vi.fn() } },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;push;/sign-in;303;",
    });
  }),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      signUpEmail: mockSignUpEmail,
      signInEmail: mockSignInEmail,
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

import { signupAction, loginAction } from "@/features/auth/actions";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signupAction", () => {
  const validInput = {
    name: "New User",
    email: "newuser@example.com",
    password: "StrongPass1",
  };

  it("registers a user and returns success", async () => {
    mockSignUpEmail.mockResolvedValueOnce({
      user: { id: "new-id" },
      token: "t",
    });

    const result = await signupAction(validInput);

    expect(result.data).toEqual({ success: true });
    expect(result.serverError).toBeUndefined();
    expect(result.validationErrors).toBeUndefined();
    expect(mockSignUpEmail).toHaveBeenCalledWith({
      body: {
        name: "New User",
        email: "newuser@example.com",
        password: "StrongPass1",
      },
    });
  });

  it("returns validation errors for short name", async () => {
    const result = await signupAction({ ...validInput, name: "A" });
    expect(result.validationErrors?.name?._errors).toBeDefined();
  });

  it("returns validation errors for invalid email", async () => {
    const result = await signupAction({ ...validInput, email: "not-an-email" });
    expect(result.validationErrors?.email?._errors).toBeDefined();
  });

  it("returns validation errors for weak password", async () => {
    const result = await signupAction({ ...validInput, password: "short" });
    expect(result.validationErrors?.password?._errors).toBeDefined();
  });

  it("returns server error when better-auth API errors", async () => {
    const apiError = Object.assign(new Error("Email already in use"), {
      statusCode: 422,
    });
    mockSignUpEmail.mockRejectedValueOnce(apiError);
    const result = await signupAction(validInput);
    expect(result.serverError).toBe("Email already in use");
  });

  it("re-throws non-API errors", async () => {
    mockSignUpEmail.mockRejectedValueOnce(new Error("Network error"));
    const result = await signupAction(validInput);
    expect(result.serverError).toBe("Network error");
  });
});

describe("loginAction", () => {
  const validInput = { email: "user@example.com", password: "Password1" };

  it("returns shop slug when user has a shop", async () => {
    mockSignInEmail.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockPrisma.shop.findUnique.mockResolvedValue({ slug: "my-shop" });

    const result = await loginAction(validInput);

    expect(result.data).toEqual({ shopSlug: "my-shop" });
    expect(result.serverError).toBeUndefined();
  });

  it("returns null shop slug when user has no shop", async () => {
    mockSignInEmail.mockResolvedValueOnce({ user: { id: "user-1" } });
    mockPrisma.shop.findUnique.mockResolvedValue(null);

    const result = await loginAction(validInput);
    expect(result.data).toEqual({ shopSlug: null });
  });

  it("returns validation errors for empty password", async () => {
    const result = await loginAction({
      email: "user@example.com",
      password: "",
    });
    expect(result.validationErrors?.password?._errors).toBeDefined();
  });

  it("returns server error when credentials are wrong", async () => {
    const apiError = Object.assign(new Error("Invalid email or password"), {
      statusCode: 401,
    });
    mockSignInEmail.mockRejectedValueOnce(apiError);
    const result = await loginAction(validInput);
    expect(result.serverError).toBe("Invalid email or password");
  });
});
