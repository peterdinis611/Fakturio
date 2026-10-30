"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useDebouncer } from "@tanstack/react-pacer";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type Props = {
  value: string;
  onValueChange: (next: string) => void;
  /** Optional URL sync (bookmarkable query). */
  path?: string;
  param?: string;
  extraParams?: Record<string, string | undefined | null>;
  placeholder?: string;
  className?: string;
  waitMs?: number;
};

/**
 * Local search input backed by Fuse.js consumers.
 * Debounces optional URL sync via TanStack Pacer; filtering stays instant.
 */
export function FuzzySearchField({
  value,
  onValueChange,
  path,
  param = "q",
  extraParams,
  placeholder = "Hľadať…",
  className,
  waitMs = 280,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const urlDebouncer = useDebouncer(
    (next: string) => {
      if (!path) return;
      const trimmed = next.trim();
      const url = new URL(path, "http://local");
      if (extraParams) {
        for (const [key, val] of Object.entries(extraParams)) {
          if (val != null && val !== "") url.searchParams.set(key, val);
        }
      }
      if (trimmed) url.searchParams.set(param, trimmed);
      else url.searchParams.delete(param);
      const href = `${url.pathname}${url.search}`;
      startTransition(() => {
        router.replace(href);
      });
    },
    { wait: waitMs },
  );

  return (
    <div className={cn("mb-4 flex max-w-sm gap-2", className)}>
      <input
        name={param}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          onValueChange(next);
          if (path) urlDebouncer.maybeExecute(next);
        }}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="h-9 flex-1 rounded-[6px] border border-control bg-surface px-3 text-[14px] outline-none focus:ring-2 focus:ring-ink/15"
      />
      {path ? (
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => urlDebouncer.flush()}
        >
          Hľadať
        </Button>
      ) : null}
    </div>
  );
}
