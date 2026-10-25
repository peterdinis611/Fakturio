"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileText,
  UserPlus,
} from "lucide-react";
import { CreateCustomerDialog } from "@/components/customers/create-customer-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    title: "Firma",
    body: "IČO, IBAN a predvoľby faktúry",
    href: "/settings/company",
    icon: Building2,
    cta: "Nastavenia",
  },
  {
    n: "02",
    title: "Zákazník",
    body: "Odberateľ pred prvou faktúrou",
    href: "/customers",
    icon: UserPlus,
    cta: "Zákazníci",
    customer: true,
  },
  {
    n: "03",
    title: "Faktúra",
    body: "Číslo, VS a PDF s QR",
    href: "/invoices/new",
    icon: FileText,
    cta: "Vystaviť",
    primary: true,
  },
] as const;

const GHOST_KPIS: { label: string; value: string; lead?: boolean }[] = [
  { label: "Neuhradené celkom", value: "—", lead: true },
  { label: "Inkaso", value: "—" },
  { label: "Vystavené", value: "—" },
];

const GHOST_BUCKETS = [
  { label: "Zaplatené", tone: "text-faint" },
  { label: "Neuhradené", tone: "text-faint" },
  { label: "Po splatnosti", tone: "text-faint" },
  { label: "Koncepty", tone: "text-faint" },
] as const;

export function DashboardEmpty() {
  return (
    <div className="space-y-10">
      {/* Hero finding + primary job */}
      <div className="relative overflow-hidden border-b border-rule pb-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-2 select-none font-mono text-[9rem] leading-none font-bold text-ink/[0.035] sm:text-[11rem]"
        >
          00
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-12">
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-flex size-11 items-center justify-center rounded-[4px] border border-ink bg-ink text-primary-foreground"
              >
                <span className="text-[13px] font-bold tracking-wide">F</span>
              </span>
              <p className="text-[11px] font-medium tracking-[0.16em] text-faint uppercase">
                Ledger · deň 0
              </p>
            </div>

            <h2 className="mt-5 max-w-lg text-[28px] leading-[1.15] font-semibold tracking-tight text-ink sm:text-[32px]">
              Vystav prvú faktúru
            </h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
              Dostane číslo, variabilný symbol a IBAN do PDF. Potom tu uvidíš
              neuhradené, splatnosti a inkaso — rovnaký prehľad, aký používaš
              každý deň.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button asChild size="lg" className="h-10 px-4">
                <Link href="/invoices/new">
                  Nová faktúra
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </Button>
              <CreateCustomerDialog
                trigger={
                  <Button type="button" variant="outline" size="lg" className="h-10">
                    Pridať zákazníka
                  </Button>
                }
              />
              <Button asChild variant="ghost" size="lg" className="h-10">
                <Link href="/settings">Nastavenia</Link>
              </Button>
            </div>
          </div>

          {/* Mini checklist */}
          <ol className="divide-y divide-rule border-y border-rule">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const rowClass =
                "group flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:bg-raised/40";

              const inner = (
                <>
                  <span className="font-mono text-[11px] tabular-nums text-faint">
                    {step.n}
                  </span>
                  <span
                    aria-hidden
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-border text-muted-foreground group-hover:border-control group-hover:text-ink"
                  >
                    <Icon className="size-3.5" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-ink">
                      {step.title}
                    </span>
                    <span className="block text-[12px] text-muted-foreground">
                      {step.body}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-[12px] font-medium",
                      "primary" in step && step.primary
                        ? "text-ink"
                        : "text-faint group-hover:text-ink",
                    )}
                  >
                    {step.cta}
                  </span>
                </>
              );

              if ("customer" in step && step.customer) {
                return (
                  <li key={step.n}>
                    <CreateCustomerDialog
                      trigger={
                        <button type="button" className={rowClass}>
                          {inner}
                        </button>
                      }
                    />
                  </li>
                );
              }

              return (
                <li key={step.n}>
                  <Link href={step.href} className={rowClass}>
                    {inner}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Ghost preview of the filled dashboard — teaches the layout */}
      <div aria-hidden className="pointer-events-none select-none opacity-[0.55]">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[11px] font-medium tracking-[0.14em] text-faint uppercase">
            Takto bude vyzerať prehľad
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-[1.4fr_auto_auto] sm:items-end">
          {GHOST_KPIS.map((k) => (
            <div key={k.label}>
              <p className="text-[13px] text-muted-foreground">{k.label}</p>
              <p
                className={cn(
                  "money mt-1 leading-none tracking-tight text-faint",
                  k.lead ? "text-[32px]" : "text-[24px]",
                )}
              >
                {k.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bar-track mt-5">
          <div className="h-full w-full bg-raised" />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-[15px] font-medium text-ink/70">Stavy</p>
            <ul className="divide-y divide-rule border-t border-rule">
              {GHOST_BUCKETS.map((b) => (
                <li
                  key={b.label}
                  className="flex items-baseline justify-between gap-3 py-3"
                >
                  <span className={cn("text-[14px]", b.tone)}>
                    {b.label}
                    <span className="ml-1.5 text-faint data-num">0</span>
                  </span>
                  <span className="money text-[14px] text-faint">—</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[15px] font-medium text-ink/70">Splatnosti</p>
            <div className="border-t border-rule py-5">
              <p className="text-[14px] text-faint">Zatiaľ prázdne</p>
              <p className="mt-1 text-[13px] text-faint/80">
                Po vystavení sa tu objavia blížiace sa termíny.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
