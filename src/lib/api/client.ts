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

function mergeHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  const body = init?.body;
  if (
    body != null &&
    !(body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
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
      headers: mergeHeaders(init),
    });
  } catch (err) {
    const hint =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Network or CORS error — ensure the API is running on port 6010"
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

/** Multipart upload — do not set Content-Type (browser sets boundary). */
export async function apiFetchFormData<T>(
  path: string,
  form: FormData,
): Promise<T> {
  const url = apiUrl(path);
  let res: Response;

  try {
    res = await fetch(url, { method: "POST", body: form });
  } catch (err) {
    throw new ApiError(0, {
      ok: false,
      error:
        err instanceof Error
          ? `${err.message} (${url})`
          : `Network error (${url})`,
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
