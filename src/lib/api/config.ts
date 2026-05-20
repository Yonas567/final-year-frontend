/** Backend origin without trailing slash or `/api` suffix. */
export function getApiOrigin(): string {
  const raw = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  ).replace(/\/$/, "");
  return raw.endsWith("/api") ? raw.slice(0, -4) : raw;
}

/** Full URL for an API path (prefix `/api` is added automatically). */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getApiOrigin()}/api${p}`;
}

export function getWebSocketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicit) {
    const u = explicit.replace(/\/$/, "");
    return u.endsWith("/ws") ? u : `${u}/ws`;
  }
  try {
    const origin = getApiOrigin();
    const url = new URL(origin);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return `ws://${url.hostname}:6010/ws`;
    }
    const wsProto = url.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProto}//${url.host}/ws`;
  } catch {
    return "ws://localhost:6010/ws";
  }
}

export const DEFAULT_DEVICE_ID =
  process.env.NEXT_PUBLIC_DEVICE_ID?.trim() || "esp32-01";
