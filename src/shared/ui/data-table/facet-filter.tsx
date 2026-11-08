"use client";

import { Check, PlusCircle, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";

export type FacetOption = {
  value: string;
  label: string;
  count?: number;
};

export function DataTableFacetFilter({
  title,
  options,
  selected,
  onChange,
  resetLabel = "Reset",
}: {
  title: string;
  options: FacetOption[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  resetLabel?: string;
}) {
  const selectedCount = selected.size;

  function toggle(value: string) {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-dashed"
        >
          <PlusCircle className="size-3.5" aria-hidden />
          {title}
          {selectedCount > 0 ? (
            <>
              <span className="mx-0.5 h-3.5 w-px bg-border" aria-hidden />
              <Badge
                variant="secondary"
                className="rounded-[3px] px-1.5 py-0 text-[10px] font-medium"
              >
                {selectedCount}
              </Badge>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
          <p className="text-[12px] font-medium text-ink">{title}</p>
          {selectedCount > 0 ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-ink"
              onClick={() => onChange(new Set())}
            >
              <X className="size-3" aria-hidden />
              {resetLabel}
            </button>
          ) : null}
        </div>
        <ul className="max-h-56 space-y-0.5 overflow-auto">
          {options.map((opt) => {
            const active = selected.has(opt.value);
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-left text-[13px] transition-colors",
                    active ? "bg-raised text-ink" : "hover:bg-raised/60 text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-[3px] border",
                      active
                        ? "border-ink bg-ink text-ground"
                        : "border-border",
                    )}
                    aria-hidden
                  >
                    {active ? <Check className="size-2.5" /> : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {opt.count != null ? (
                    <span className="tabular-nums text-[11px] text-muted-foreground">
                      {opt.count}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
