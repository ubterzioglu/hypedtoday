import { describe, expect, it } from "vitest";

import { normalizeBaseUrl, normalizePath } from "@/lib/auth-redirect";

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

describe("normalizePath", () => {
  it("keeps safe in-app paths", () => {
    expect(normalizePath("/add-project")).toBe("/add-project");
  });

  it("falls back to root for unsafe values", () => {
    expect(normalizePath("https://evil.example")).toBe("/");
    expect(normalizePath(undefined)).toBe("/");
  });
});
