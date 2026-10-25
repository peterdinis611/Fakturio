"use client";

import { useTheme } from "@teispace/next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const options = [
  {
    value: "light",
    label: "Svetlý",
    hint: "Papierový ledger",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Tmavý",
    hint: "Nočný režim",
    icon: Moon,
  },
  {
    value: "system",
    label: "Systém",
    hint: "Podľa zariadenia",
    icon: Monitor,
  },
] as const;

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme ?? "system") : "system";

  return (
    <fieldset className="max-w-lg">
      <legend className="sr-only">Téma</legend>
      <ul className="divide-y divide-rule border-t border-rule">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = current === opt.value;
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => setTheme(opt.value)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:bg-raised/50",
                  selected && "bg-raised/30",
                )}
              >
                <span
                  className={cn(
                    "stamp shrink-0",
                    selected
                      ? "border-ink text-ink"
                      : "border-muted text-muted-foreground",
                  )}
                  aria-hidden
                >
                  <Icon className="size-3" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-ink">
                    {opt.label}
                  </span>
                  <span className="block text-[13px] text-muted-foreground">
                    {opt.hint}
                  </span>
                </span>
                <span
                  className={cn(
                    "size-4 shrink-0 rounded-full border",
                    selected
                      ? "border-ink bg-ink"
                      : "border-control bg-transparent",
                  )}
                  aria-hidden
                />
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
