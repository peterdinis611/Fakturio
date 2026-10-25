"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 280;

export function SearchBox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  const syncFromUrl = useEffectEvent((q: string) => {
    setValue(q);
  });

  useEffect(() => {
    syncFromUrl(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const next = value.trim();
    const current = initialQuery.trim();
    if (next === current) return;

    const timer = window.setTimeout(() => {
      startTransition(() => {
        if (!next) {
          router.replace("/search");
          return;
        }
        router.replace(`/search?q=${encodeURIComponent(next)}`);
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [value, initialQuery, router]);

  return (
    <div
      className={cn(
        "mb-8 flex overflow-hidden rounded-[4px] border border-border bg-surface shadow-[0_1px_0_var(--rule)]",
        "focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/10",
      )}
    >
      <label className="relative flex min-w-0 flex-1 items-center">
        <span className="sr-only">Hľadať zákazníkov a faktúry</span>
        <Search
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-3.5 size-4 transition-colors",
            pending ? "text-ink" : "text-faint",
          )}
        />
        <input
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Meno, IČO, číslo faktúry…"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className="h-12 w-full bg-transparent pr-3 pl-10 text-[15px] text-ink outline-none placeholder:text-faint"
        />
        {pending ? (
          <span
            aria-hidden
            className="absolute right-3.5 size-3.5 animate-spin rounded-full border-2 border-border border-t-ink"
          />
        ) : null}
      </label>
    </div>
  );
}
