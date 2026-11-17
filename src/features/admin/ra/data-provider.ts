import {
  fetchUtils,
  type DataProvider,
  type GetListParams,
  type RaRecord,
} from "react-admin";

const apiUrl = "/api/ra";

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const opts: fetchUtils.Options = {
    ...options,
    credentials: "same-origin",
    headers: new Headers({
      Accept: "application/json",
      ...(options.headers as HeadersInit),
    }),
  };
  return fetchUtils.fetchJson(url, opts);
};

function listQuery(params: GetListParams) {
  const page = params.pagination?.page ?? 1;
  const perPage = params.pagination?.perPage ?? 25;
  const field = params.sort?.field ?? "id";
  const order = params.sort?.order ?? "DESC";
  const start = (page - 1) * perPage;
  const end = page * perPage;
  const query = new URLSearchParams({
    _start: String(start),
    _end: String(end),
    _sort: field,
    _order: order,
  });
  if (typeof params.filter?.q === "string" && params.filter.q.trim()) {
    query.set("q", params.filter.q.trim());
  }
  for (const key of ["companyId", "status"] as const) {
    const value = params.filter?.[key];
    if (typeof value === "string" && value.trim()) {
      query.set(key, value.trim());
    }
  }
  return query.toString();
}

/** Single-record resources — always addressed as `<resource>/current`. */
const SINGLETON_RESOURCES = new Set(["dashboard", "job-settings"]);

function recordId(resource: string, id: unknown) {
  return SINGLETON_RESOURCES.has(resource) ? "current" : String(id);
}

function parseRangeTotal(contentRange: string | null, fallback: number) {
  if (!contentRange) return fallback;
  const match = /\/(\d+)$/.exec(contentRange);
  return match ? parseInt(match[1], 10) : fallback;
}

export const adminDataProvider: DataProvider = {
  getList: async (resource, params) => {
    const url = `${apiUrl}/${resource}?${listQuery(params)}`;
    const { json, headers } = await httpClient(url);
    const data = Array.isArray(json) ? json : [];
    return {
      data,
      total: parseRangeTotal(headers.get("content-range"), data.length),
    };
  },

  getOne: async (resource, params) => {
    const { json } = await httpClient(
      `${apiUrl}/${resource}/${recordId(resource, params.id)}`,
    );
    return { data: json };
  },

  getMany: async (resource, params) => {
    const results = await Promise.all(
      params.ids.map(async (id) => {
        const { json } = await httpClient(
          `${apiUrl}/${resource}/${recordId(resource, id)}`,
        );
        return json;
      }),
    );
    return { data: results };
  },

  getManyReference: async (resource, params) => {
    const url = `${apiUrl}/${resource}?${listQuery({
      ...params,
      filter: { ...params.filter, [params.target]: params.id },
    })}`;
    const { json, headers } = await httpClient(url);
    const data = Array.isArray(json) ? json : [];
    return {
      data,
      total: parseRangeTotal(headers.get("content-range"), data.length),
    };
  },

  update: async (resource, params) => {
    const { json } = await httpClient(
      `${apiUrl}/${resource}/${recordId(resource, params.id)}`,
      {
        method: "PUT",
        body: JSON.stringify(params.data),
      },
    );
    return { data: json };
  },

  updateMany: async (resource, params) => {
    const ids = await Promise.all(
      params.ids.map(async (id) => {
        await httpClient(`${apiUrl}/${resource}/${id}`, {
          method: "PUT",
          body: JSON.stringify(params.data),
        });
        return id;
      }),
    );
    return { data: ids };
  },

  create: async () => {
    throw new Error("Create is not supported in platform admin");
  },

  delete: async <RecordType extends RaRecord = RaRecord>(
    resource: string,
    params: { id: RecordType["id"]; previousData?: RecordType },
  ) => {
    await httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
    });
    return {
      data: (params.previousData ?? { id: params.id }) as RecordType,
    };
  },

  deleteMany: async (resource, params) => {
    const ids = await Promise.all(
      params.ids.map(async (id) => {
        await httpClient(`${apiUrl}/${resource}/${id}`, { method: "DELETE" });
        return id;
      }),
    );
    return { data: ids };
  },
};
