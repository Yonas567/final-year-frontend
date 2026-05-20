/** Production backend (no trailing slash, no /api). */
export const PRODUCTION_API_ORIGIN =
  "https://apiearthquake.yonasproject.cloud";

/** Local development backend. */
export const DEV_API_ORIGIN = "http://localhost:6010";

function normalizeOrigin(raw: string): string {
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

function isLocalhost(origin: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(origin);
}

function defaultOrigin(): string {
  return process.env.NODE_ENV === "production"
    ? PRODUCTION_API_ORIGIN
    : DEV_API_ORIGIN;
}

/**
 * Resolves API host for proxy + WebSocket.
 * Production never uses localhost unless API_URL explicitly points to a non-local host.
 */
export function resolveApiOrigin(): string {
  const explicit = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).trim();

  if (!explicit) {
    return defaultOrigin();
  }

  const origin = normalizeOrigin(explicit);

  if (process.env.NODE_ENV === "production" && isLocalhost(origin)) {
    return PRODUCTION_API_ORIGIN;
  }

  return origin;
}
