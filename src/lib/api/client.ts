import { apiUrl } from "./config";
import type { ApiErrorBody } from "./types";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = apiUrl(path);
  let res: Response;

  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (err) {
    const hint =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Network or CORS error — ensure the API is deployed and reachable via the /api proxy"
        : "Network error";
    throw new ApiError(0, {
      ok: false,
      error: `${hint}: ${url}`,
      code: "NETWORK_ERROR",
    });
  }

  const json = (await res.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!res.ok || json.ok === false) {
    throw new ApiError(res.status, {
      ok: false,
      error:
        (json as ApiErrorBody).error ||
        `${res.status} ${res.statusText} (${url})`,
      code: (json as ApiErrorBody).code,
    });
  }

  return json;
}
