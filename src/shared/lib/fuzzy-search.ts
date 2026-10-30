import Fuse, { type IFuseOptions, type FuseResult } from "fuse.js";

export const DEFAULT_FUSE_THRESHOLD = 0.38;

export type FuzzySearchOptions<T> = {
  keys: IFuseOptions<T>["keys"];
  threshold?: number;
  limit?: number;
  /** When true, empty/whitespace query returns all items. Default true. */
  matchAllOnEmpty?: boolean;
} & Omit<IFuseOptions<T>, "keys" | "threshold">;

export function createFuzzyIndex<T>(
  items: readonly T[],
  options: FuzzySearchOptions<T>,
): Fuse<T> {
  const {
    keys,
    threshold = DEFAULT_FUSE_THRESHOLD,
    matchAllOnEmpty: _matchAllOnEmpty,
    limit: _limit,
    ...rest
  } = options;

  return new Fuse([...items], {
    keys,
    threshold,
    ignoreLocation: true,
    includeScore: true,
    ...rest,
  });
}

export function fuzzySearch<T>(
  items: readonly T[],
  query: string,
  options: FuzzySearchOptions<T>,
): T[] {
  const trimmed = query.trim();
  const matchAllOnEmpty = options.matchAllOnEmpty ?? true;

  if (!trimmed) {
    return matchAllOnEmpty ? [...items] : [];
  }

  if (items.length === 0) return [];

  const fuse = createFuzzyIndex(items, options);
  const results: FuseResult<T>[] = fuse.search(
    trimmed,
    options.limit != null ? { limit: options.limit } : undefined,
  );
  return results.map((r) => r.item);
}

/** Preset key maps used across Fakturio list UIs. */
export const fuzzyKeys = {
  country: ["name", "code", "dial"] as const,
  customer: ["name", "ico", "dic", "email", "phone", "city", "street"] as const,
  invoice: [
    "number",
    "customerName",
    "status",
    "documentType",
  ] as const,
  auditLog: [
    "summary",
    "entityNumber",
    "entityType",
    "action",
    "actorDisplayName",
    "actorEmail",
  ] as const,
  searchHit: [
    "title",
    "subtitle",
    "number",
    "email",
    "ico",
  ] as const,
} as const;
