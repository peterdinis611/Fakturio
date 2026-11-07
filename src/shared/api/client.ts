import { getAccessToken } from "@/shared/auth/session";
import {
  CORRELATION_HEADER,
  createCorrelationId,
} from "@/shared/lib/logger";
import { ApiError } from "./errors";
import { logApiFailure } from "./log";
import type { ApiProblem } from "./types";

const DEFAULT_BASE = "http://localhost:5148";

export function getApiBaseUrl() {
  return process.env.API_BASE_URL?.replace(/\/$/, "") || DEFAULT_BASE;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | null | undefined>;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  /** Skip reading the session cookie (login/register). */
  skipAuth?: boolean;
};

function buildUrl(path: string, searchParams?: RequestOptions["searchParams"]) {
  const url = new URL(
    path.startsWith("/") ? path : `/${path}`,
    `${getApiBaseUrl()}/`,
  );
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseProblem(res: Response): Promise<ApiProblem> {
  try {
    const data = (await res.json()) as ApiProblem & {
      extensions?: { code?: string };
    };
    return {
      ...data,
      code: data.code ?? data.extensions?.code,
    };
  } catch {
    return {
      title: "Požiadavka zlyhala",
      detail: `HTTP ${res.status}`,
      status: res.status,
      code: "bad_request",
    };
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    searchParams,
    headers,
    cache,
    next,
    skipAuth,
  } = options;
  const authHeader = skipAuth ? {} : await getAuthHeader();
  const correlationId = createCorrelationId();
  let res: Response;
  try {
    res = await fetch(buildUrl(path, searchParams), {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        [CORRELATION_HEADER]: correlationId,
        ...authHeader,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache,
      next,
    });
  } catch (cause) {
    const problem: ApiProblem = {
      title: "Server nedostupný",
      detail: "Server je nedostupný. Skontroluj pripojenie a skús znova.",
      status: 0,
      code: "server_unreachable",
    };
    logApiFailure({ method, path, status: 0, problem, cause, correlationId });
    throw new ApiError(0, problem).markLogged();
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    const problem = await parseProblem(res);
    logApiFailure({
      method,
      path,
      status: res.status,
      problem,
      correlationId: res.headers.get(CORRELATION_HEADER) ?? correlationId,
    });
    throw new ApiError(res.status, problem).markLogged();
  }

  if (res.headers.get("content-type")?.includes("application/json")) {
    return (await res.json()) as T;
  }

  return undefined as T;
}

/** Multipart upload — do not set Content-Type (boundary is set by fetch). */
export async function apiFetchFormData<T>(
  path: string,
  formData: FormData,
  options: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  const { method = "POST", searchParams, headers, cache, next, skipAuth } =
    options;
  const authHeader = skipAuth ? {} : await getAuthHeader();
  const correlationId = createCorrelationId();
  let res: Response;
  try {
    res = await fetch(buildUrl(path, searchParams), {
      method,
      headers: {
        Accept: "application/json",
        [CORRELATION_HEADER]: correlationId,
        ...authHeader,
        ...headers,
      },
      body: formData,
      cache,
      next,
    });
  } catch (cause) {
    const problem: ApiProblem = {
      title: "Server nedostupný",
      detail: "Server je nedostupný. Skontroluj pripojenie a skús znova.",
      status: 0,
      code: "server_unreachable",
    };
    logApiFailure({ method, path, status: 0, problem, cause, correlationId });
    throw new ApiError(0, problem).markLogged();
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    const problem = await parseProblem(res);
    logApiFailure({
      method,
      path,
      status: res.status,
      problem,
      correlationId: res.headers.get(CORRELATION_HEADER) ?? correlationId,
    });
    throw new ApiError(res.status, problem).markLogged();
  }

  if (res.headers.get("content-type")?.includes("application/json")) {
    return (await res.json()) as T;
  }

  return undefined as T;
}

export async function apiFetchBlob(
  path: string,
  searchParams?: RequestOptions["searchParams"],
  accept = "application/pdf, text/csv, */*",
): Promise<{ blob: Blob; filename: string | null; contentType: string | null }> {
  const authHeader = await getAuthHeader();
  const correlationId = createCorrelationId();
  let res: Response;
  try {
    res = await fetch(buildUrl(path, searchParams), {
      headers: {
        Accept: accept,
        [CORRELATION_HEADER]: correlationId,
        ...authHeader,
      },
      cache: "no-store",
    });
  } catch (cause) {
    const problem: ApiProblem = {
      title: "Server nedostupný",
      detail: "Server je nedostupný. Skontroluj pripojenie a skús znova.",
      status: 0,
      code: "server_unreachable",
    };
    logApiFailure({
      method: "GET",
      path,
      status: 0,
      problem,
      cause,
      correlationId,
    });
    throw new ApiError(0, problem).markLogged();
  }

  if (!res.ok) {
    const problem = await parseProblem(res);
    logApiFailure({
      method: "GET",
      path,
      status: res.status,
      problem,
      correlationId: res.headers.get(CORRELATION_HEADER) ?? correlationId,
    });
    throw new ApiError(res.status, problem).markLogged();
  }

  const disposition = res.headers.get("content-disposition");
  const match = disposition?.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
  const filename = match?.[1]
    ? decodeURIComponent(match[1].replace(/"/g, ""))
    : null;

  return {
    blob: await res.blob(),
    filename,
    contentType: res.headers.get("content-type"),
  };
}
