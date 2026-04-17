function normalizeBaseUrl(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);
    url.hash = "";
    url.search = "";
    url.pathname = "/";
    return url.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export function getAuthRedirectUrl(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const configuredUrl = normalizeBaseUrl(import.meta.env.VITE_SITE_URL ?? "");
  if (configuredUrl) {
    return `${configuredUrl}/`;
  }

  return `${window.location.origin}/`;
}

export { normalizeBaseUrl };
