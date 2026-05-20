import { NextRequest, NextResponse } from "next/server";

/** Server-only — set at container runtime (no rebuild needed). */
function getBackendOrigin(): string {
  const raw =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:6010";
  return raw.replace(/\/$/, "").replace(/\/api$/, "");
}

async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const segment = path?.join("/") ?? "";
  const target = new URL(`/api/${segment}`, getBackendOrigin());
  target.search = req.nextUrl.search;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), {
      method: req.method,
      headers,
      body,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upstream request failed";
    return NextResponse.json(
      {
        ok: false,
        error: `Cannot reach API at ${getBackendOrigin()}: ${message}`,
        code: "UPSTREAM_UNREACHABLE",
      },
      { status: 502 },
    );
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
