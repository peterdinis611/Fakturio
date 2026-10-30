"use client";

import Link from "next/link";
import { ArrowUpRight, FileSearch, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

function SuggestionRow({
  mark,
  label,
  sample,
  mono,
  onPick,
}: {
  mark: string;
  label: string;
  sample: string;
  mono?: boolean;
  onPick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        className="group flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-raised/50"
      >
        <span
          aria-hidden
          className="stamp shrink-0 border-control text-[9px] text-muted-foreground group-hover:border-ink group-hover:text-ink"
        >
          {mark}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] tracking-wide text-faint uppercase">
            {label}
          </span>
          <span
            className={cn(
              "mt-0.5 block text-[15px] text-ink",
              mono && "font-mono tabular-nums",
            )}
          >
            {sample}
          </span>
        </span>
        <ArrowUpRight
          aria-hidden
          className="size-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
    </li>
  );
}

/** Idle state — before the user types. */
export function SearchIdle() {
  const t = useTranslations("Search");
  const router = useRouter();

  const suggestions = [
    { q: "Acme", mark: "Z", label: t("suggestCompany"), sample: "Acme" },
    {
      q: "12345678",
      mark: "IČ",
      label: t("suggestIco"),
      sample: "12345678",
      mono: true,
    },
    {
      q: "2026-001",
      mark: "F",
      label: t("suggestInvoice"),
      sample: "2026-001",
      mono: true,
    },
  ] as const;

  return (
    <div className="relative overflow-hidden border-t border-rule pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 -right-2 select-none font-mono text-[9rem] leading-none font-bold text-ink/[0.035] sm:text-[11rem]"
      >
        /
      </div>

      <div className="relative grid gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-14">
        <div className="max-w-md">
          <p className="text-[11px] font-medium tracking-[0.16em] text-faint uppercase">
            {t("idleEyebrow")}
          </p>
          <h2 className="mt-3 text-[28px] leading-[1.15] font-semibold tracking-tight text-ink">
            {t("idleTitle")}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
            {t("idleBody")}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-faint">
            <span className="inline-flex items-center gap-1.5">
              <span className="stamp size-4 border-control text-[8px]">Z</span>
              {t("customers")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="stamp size-4 border-ink text-[8px] text-ink">
                F
              </span>
              {t("invoices")}
            </span>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-rule pb-2">
            <p className="text-[11px] font-medium tracking-[0.14em] text-faint uppercase">
              {t("tryEyebrow")}
            </p>
            <Search
              aria-hidden
              className="size-3.5 text-faint"
              strokeWidth={1.5}
            />
          </div>
          <ul className="divide-y divide-rule">
            {suggestions.map((s) => (
              <SuggestionRow
                key={s.q}
                mark={s.mark}
                label={s.label}
                sample={s.sample}
                mono={"mono" in s ? s.mono : false}
                onPick={() =>
                  router.replace(`/search?q=${encodeURIComponent(s.q)}`)
                }
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Query too short (&lt; 2 chars). */
export function SearchTooShort() {
  const t = useTranslations("Search");

  return (
    <div className="relative border-t border-rule pt-10">
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-[4px] border border-border bg-raised/40 text-muted-foreground"
        >
          <Search className="size-[18px]" strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">
            {t("tooShortTitle")}
          </h2>
          <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
            {t("tooShortBody", { count: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Zero hits for an active query. */
export function SearchNoResults({ query }: { query: string }) {
  const t = useTranslations("Search");

  return (
    <div className="relative overflow-hidden border-t border-rule pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute top-4 right-0 select-none font-mono text-[7rem] leading-none font-bold text-ink/[0.035]"
      >
        0
      </div>

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <span
            aria-hidden
            className="mb-4 inline-flex size-11 items-center justify-center rounded-[4px] border border-border bg-raised/40 text-muted-foreground"
          >
            <FileSearch className="size-[18px]" strokeWidth={1.5} />
          </span>
          <h2 className="text-[22px] font-semibold tracking-tight text-ink">
            {t("noResultsTitle")}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            {t("noResultsBody", { query })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/customers">{t("customers")}</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/invoices">{t("invoices")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
