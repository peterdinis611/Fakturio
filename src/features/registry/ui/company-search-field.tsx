"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { searchRegistryAction } from "@/features/registry/api/registry";
import type { RegistrySearchHit } from "@/shared/api/types";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onPick: (hit: RegistrySearchHit) => void;
  country?: string | null;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  className?: string;
};

export function CompanySearchField({
  id,
  value,
  onChange,
  onPick,
  country = "SK",
  disabled,
  "aria-invalid": ariaInvalid,
  className,
}: Props) {
  const t = useTranslations("Registry");
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<RegistrySearchHit[]>([]);
  const [pending, startTransition] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supported = (country ?? "").toUpperCase() === "SK";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!supported) {
      setHits([]);
      setOpen(false);
      return;
    }

    const q = value.trim();
    if (q.length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await searchRegistryAction({ q, country: "SK", limit: 8 });
        if (!result?.data) {
          setHits([]);
          return;
        }
        setHits(result.data.hits);
        setOpen(result.data.hits.length > 0);
      });
    }, 280);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, supported]);

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        autoComplete="organization"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (hits.length > 0) setOpen(true);
        }}
      />
      {supported && pending ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{t("searching")}</p>
      ) : null}
      {open && hits.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-[4px] border border-border bg-surface shadow-md"
        >
          {hits.map((hit) => (
            <li key={hit.ico} role="option">
              <button
                type="button"
                className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-[13px] hover:bg-raised"
                onClick={() => {
                  onPick(hit);
                  setOpen(false);
                  setHits([]);
                }}
              >
                <span className="font-medium text-ink">{hit.name}</span>
                <span className="data-num text-[11px] text-muted-foreground">
                  IČO {hit.ico}
                  {hit.city ? ` · ${hit.city}` : ""}
                  {hit.icDph ? ` · ${hit.icDph}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
