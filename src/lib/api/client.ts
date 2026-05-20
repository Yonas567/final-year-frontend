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
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const json = (await res.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!res.ok || json.ok === false) {
    throw new ApiError(res.status, {
      ok: false,
      error:
        (json as ApiErrorBody).error ||
        res.statusText ||
        "Request failed",
      code: (json as ApiErrorBody).code,
    });
  }

  return json;
}
