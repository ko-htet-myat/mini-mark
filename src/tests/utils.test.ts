import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges classes correctly", () => {
    expect(cn("btn", "btn-primary")).toBe("btn btn-primary");
  });
});
