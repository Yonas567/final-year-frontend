import { PRODUCTION_API_ORIGIN, resolveApiOrigin } from "./origins";

export function getBackendOrigin(): string {
  return resolveApiOrigin();
}

export function isProductionMisconfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const explicit = (process.env.API_URL || "").trim();
  if (!explicit) return false;
  return /localhost|127\.0\.0\.1/i.test(explicit);
}

export function upstreamConfigHint(): string {
  const origin = getBackendOrigin();
  if (isProductionMisconfigured()) {
    return (
      `API_URL was set to localhost in production; using ${PRODUCTION_API_ORIGIN} instead. ` +
      `Remove API_URL=http://localhost:6010 from deploy env or set API_URL=${PRODUCTION_API_ORIGIN}.`
    );
  }
  return `Backend: ${origin}`;
}
