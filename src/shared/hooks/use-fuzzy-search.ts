"use client";

import { useMemo } from "react";
import {
  createFuzzyIndex,
  fuzzySearch,
  type FuzzySearchOptions,
} from "@/shared/lib/fuzzy-search";

/**
 * Memoized Fuse.js search over an in-memory list.
 * Pass stable `keys` (e.g. `fuzzyKeys.customer`) so the index is not rebuilt every render.
 */
export function useFuzzySearch<T>(
  items: readonly T[],
  query: string,
  options: FuzzySearchOptions<T>,
): T[] {
  const { keys, threshold, limit, matchAllOnEmpty } = options;

  const fuse = useMemo(
    () => createFuzzyIndex(items, options),
    // options.keys should be a module-level constant (fuzzyKeys.*)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberate: rebuild on items/keys/threshold only
    [items, keys, threshold],
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
