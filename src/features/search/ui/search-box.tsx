"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState, useTransition } from "react";
import { useDebouncer } from "@tanstack/react-pacer";
import { cn } from "@/shared/lib/utils";

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

  const debouncer = useDebouncer(
    (next: string) => {
      const trimmed = next.trim();
      const current = initialQuery.trim();
      if (trimmed === current) return;

      startTransition(() => {
        if (!trimmed) {
          router.replace("/search");
          return;
        }
        router.replace(`/search?q=${encodeURIComponent(trimmed)}`);
      });
    },
    { wait: DEBOUNCE_MS },
  );

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
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            debouncer.maybeExecute(next);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              debouncer.flush();
            }
          }}
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
