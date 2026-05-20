import type { NextConfig } from "next";

/** Backend origin for dev proxy (no trailing slash, no /api suffix). */
function apiRewriteOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:5000";
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const origin = apiRewriteOrigin();
    return [
      {
        source: "/api/:path*",
        destination: `${origin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
