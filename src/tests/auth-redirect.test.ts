import { describe, expect, it } from "vitest";

import { normalizeBaseUrl } from "@/lib/auth-redirect";

describe("normalizeBaseUrl", () => {
  it("normalizes a bare production URL", () => {
    expect(normalizeBaseUrl("https://hypedtoday.com")).toBe("https://hypedtoday.com");
  });

  it("removes path, query, and hash fragments", () => {
    expect(normalizeBaseUrl("https://hypedtoday.com/login?foo=bar#token")).toBe("https://hypedtoday.com");
  });

  it("returns undefined for invalid values", () => {
    expect(normalizeBaseUrl("not-a-url")).toBeUndefined();
    expect(normalizeBaseUrl("")).toBeUndefined();
  });
});
