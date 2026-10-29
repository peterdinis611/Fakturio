import { auth } from "@clerk/nextjs/server";
import { ApiError } from "./errors";
import type { ApiProblem } from "./types";

const DEFAULT_BASE = "http://localhost:5148";

export function getApiBaseUrl() {
  return process.env.API_BASE_URL?.replace(/\/$/, "") || DEFAULT_BASE;
}

/** Optional actor id for audit trail — not a JWT. Auth stays in Clerk/Next.js. */
async function getActorHeaders(): Promise<Record<string, string>> {
  try {
    const session = await auth();
    const userId = session.userId;
    return userId ? { "X-Clerk-User-Id": userId } : {};
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
      title: res.statusText || "Request failed",
      detail: `HTTP ${res.status}`,
      status: res.status,
    };
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, searchParams, headers, cache, next } = options;
  const actorHeaders = await getActorHeaders();
  const res = await fetch(buildUrl(path, searchParams), {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...actorHeaders,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
    next,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseProblem(res));
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
  const actorHeaders = await getActorHeaders();
  const res = await fetch(buildUrl(path, searchParams), {
    headers: { Accept: accept, ...actorHeaders },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new ApiError(res.status, await parseProblem(res));
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
