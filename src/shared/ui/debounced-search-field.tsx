"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useDebouncer } from "@tanstack/react-pacer";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type Props = {
  /** Base path without query, e.g. `/customers` or `/invoices`. */
  path: string;
  param?: string;
  initialQuery?: string;
  /** Extra query params to keep (e.g. status, overdue). */
  extraParams?: Record<string, string | undefined | null>;
  placeholder?: string;
  className?: string;
  waitMs?: number;
};

/**
 * Instant-feel search field: updates the URL query via TanStack Pacer debounce.
 */
export function DebouncedSearchField({
  path,
  param = "q",
  initialQuery = "",
  extraParams,
  placeholder,
  className,
  waitMs = 300,
}: Props) {
  const t = useTranslations("Common");
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  const debouncer = useDebouncer(
    (next: string) => {
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
          setValue(next);
          debouncer.maybeExecute(next);
        }}
        placeholder={placeholder ?? t("searchPlaceholder")}
        autoComplete="off"
        spellCheck={false}
        className="h-9 flex-1 rounded-[6px] border border-control bg-surface px-3 text-[14px] outline-none focus:ring-2 focus:ring-ink/15"
      />
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={() => debouncer.flush()}
      >
        {t("search")}
      </Button>
    </div>
  );
}
