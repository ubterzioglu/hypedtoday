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

function normalizePath(value: string | undefined): string {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  return value;
}

export function getAuthRedirectUrl(nextPath = "/"): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const configuredUrl = normalizeBaseUrl(import.meta.env.VITE_SITE_URL ?? "");
  const normalizedPath = normalizePath(nextPath);
  const callbackPath = `/auth/callback?next=${encodeURIComponent(normalizedPath)}`;
  if (configuredUrl) {
    return `${configuredUrl}${callbackPath}`;
  }

  return `${window.location.origin}${callbackPath}`;
}

export { normalizeBaseUrl, normalizePath };
