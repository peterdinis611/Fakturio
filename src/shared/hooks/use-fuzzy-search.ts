"use client";

import { useMemo } from "react";
import {
  createFuzzyIndex,
  fuzzySearch,
  type FuzzySearchOptions,
} from "@/shared/lib/fuzzy-search";

/**
 * Memoized Fuse.js search over an in-memory list.
 * Rebuilds the index when `items` or option keys change.
 */
export function useFuzzySearch<T>(
  items: readonly T[],
  query: string,
  options: FuzzySearchOptions<T>,
): T[] {
  const {
    keys,
    threshold,
    limit,
    matchAllOnEmpty,
    ignoreLocation,
    includeScore,
    ...rest
  } = options;

  const fuse = useMemo(
    () =>
      createFuzzyIndex(items, {
        keys,
        threshold,
        ignoreLocation,
        includeScore,
        ...rest,
      }),
    // Fuse options are stable in practice; keys identity matters most.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options spread is intentional
    [items, keys, threshold, ignoreLocation, includeScore],
  );

  return useMemo(() => {
    const trimmed = query.trim();
    const allowAll = matchAllOnEmpty ?? true;
    if (!trimmed) return allowAll ? [...items] : [];
    if (items.length === 0) return [];

    const results = fuse.search(
      trimmed,
      limit != null ? { limit } : undefined,
    );
    return results.map((r) => r.item);
  }, [fuse, items, query, limit, matchAllOnEmpty]);
}

/** One-shot helper for non-hook call sites (e.g. event handlers). */
export { fuzzySearch };
