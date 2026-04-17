import { describe, expect, it, vi } from "vitest";

import { normalizeBaseUrl, normalizePath, getAuthRedirectUrl } from "@/lib/auth-redirect";

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

describe("getAuthRedirectUrl", () => {
  it("uses window.location.origin when VITE_SITE_URL is not set", () => {
    vi.stubEnv("VITE_SITE_URL", "");
    const result = getAuthRedirectUrl("/add-project");
    expect(result).toContain(window.location.origin);
    expect(result).toContain("/auth/callback?next=%2Fadd-project");
    vi.unstubAllEnvs();
  });

  it("uses VITE_SITE_URL when set", () => {
    vi.stubEnv("VITE_SITE_URL", "https://hyped.today");
    const result = getAuthRedirectUrl("/admin");
    expect(result).toBe("https://hyped.today/auth/callback?next=%2Fadmin");
    vi.unstubAllEnvs();
  });

  it("returns / when nextPath is undefined", () => {
    vi.stubEnv("VITE_SITE_URL", "https://hyped.today");
    const result = getAuthRedirectUrl(undefined);
    expect(result).toContain("next=%2F");
    vi.unstubAllEnvs();
  });

  it("returns / when nextPath is empty string", () => {
    vi.stubEnv("VITE_SITE_URL", "https://hyped.today");
    const result = getAuthRedirectUrl("");
    expect(result).toContain("next=%2F");
    vi.unstubAllEnvs();
  });

  it("returns / when nextPath is invalid (not starting with /)", () => {
    vi.stubEnv("VITE_SITE_URL", "https://hyped.today");
    const result = getAuthRedirectUrl("https://evil.com");
    expect(result).toContain("next=%2F");
    vi.unstubAllEnvs();
  });

  it("correctly encodes query string in nextPath", () => {
    vi.stubEnv("VITE_SITE_URL", "https://hyped.today");
    const result = getAuthRedirectUrl("/add-project?foo=bar");
    expect(result).toContain("next=%2Fadd-project%3Ffoo%3Dbar");
    vi.unstubAllEnvs();
  });
});
