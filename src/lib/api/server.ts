/**
 * Server-only API origin (Docker / Node). Set API_URL in production — not localhost.
 */
export function getBackendOrigin(): string {
  const raw = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:6010"
  )
    .replace(/\/$/, "")
    .replace(/\/api$/, "");

  return raw;
}

export function isProductionMisconfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const o = getBackendOrigin();
  return o.includes("localhost") || o.includes("127.0.0.1");
}

export function upstreamConfigHint(): string {
  const origin = getBackendOrigin();
  if (isProductionMisconfigured()) {
    return (
      `API_URL is "${origin}" but this container cannot reach localhost. ` +
      `In your deploy panel set API_URL=https://apiearthquake.yonasproject.cloud ` +
      `(or your real backend URL), then restart the frontend container.`
    );
  }
  return `Set API_URL to your backend base URL (current: ${origin}).`;
}
