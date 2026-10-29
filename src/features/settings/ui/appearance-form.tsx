"use client";

import { useTheme } from "@teispace/next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

const options = [
  {
    value: "light",
    label: "Svetlý",
    hint: "Papierový ledger",
    icon: Sun,
    preview: {
      ground: "#eef0f3",
      surface: "#f7f8fa",
      ink: "#12151a",
      accent: "#0f766e",
    },
  },
  {
    value: "dark",
    label: "Tmavý",
    hint: "Nočný režim",
    icon: Moon,
    preview: {
      ground: "#111110",
      surface: "#1a1a18",
      ink: "#f2f2ee",
      accent: "#2dd4bf",
    },
  },
  {
    value: "system",
    label: "Systém",
    hint: "Podľa zariadenia",
    icon: Monitor,
    preview: {
      ground: "linear-gradient(135deg, #eef0f3 50%, #111110 50%)",
      surface: "linear-gradient(135deg, #f7f8fa 50%, #1a1a18 50%)",
      ink: "#787870",
      accent: "#0f766e",
    },
  },
] as const;

export function AppearanceForm() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme ?? "system") : "system";

  return (
    <fieldset>
      <legend className="sr-only">Téma</legend>
      <div
        role="radiogroup"
        aria-label="Téma"
        className="grid gap-2.5 sm:grid-cols-3"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-[6px] border text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20",
                selected
                  ? "border-ink bg-raised/40 ring-1 ring-ink/15"
                  : "border-border bg-ground/40 hover:border-control hover:bg-raised/30",
              )}
            >
              <span
                className="relative block h-16 border-b border-border/70"
                style={{ background: opt.preview.ground }}
                aria-hidden
              >
                <span
                  className="absolute inset-x-3 bottom-2 top-3 rounded-[3px] border border-black/10 shadow-sm"
                  style={{ background: opt.preview.surface }}
                >
                  <span
                    className="absolute left-2 top-2 h-1.5 w-8 rounded-sm"
                    style={{ background: opt.preview.ink, opacity: 0.85 }}
                  />
                  <span
                    className="absolute left-2 top-5 h-1 w-5 rounded-sm"
                    style={{ background: opt.preview.accent }}
                  />
                </span>
                {selected ? (
                  <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-ink text-ground">
                    <Check className="size-3" strokeWidth={2.5} />
                  </span>
                ) : null}
              </span>

              <span className="flex items-start gap-2 px-3 py-2.5">
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-[4px] border",
                    selected
                      ? "border-ink/30 bg-ink text-ground"
                      : "border-border bg-surface text-muted-foreground",
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-ink">
                    {opt.label}
                  </span>
                  <span className="block text-[11px] leading-snug text-muted-foreground">
                    {opt.hint}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
