"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useDebouncer } from "@tanstack/react-pacer";
import {
  SearchIdle,
  SearchNoResults,
  SearchTooShort,
} from "@/features/search/ui/search-empty";
import { useFuzzySearch } from "@/shared/hooks/use-fuzzy-search";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { StatusBadge } from "@/shared/ui/status-badge";
import { FadeIn } from "@/shared/ui/motion/page-motion";
import type { Customer, InvoiceListItem } from "@/shared/api/types";
import type { AppLocale } from "@/i18n/routing";

const DEBOUNCE_MS = 280;
const MIN_QUERY = 2;

type CatalogHit =
  | { kind: "customer"; item: Customer }
  | { kind: "invoice"; item: InvoiceListItem };

type Props = {
  customers: Customer[];
  invoices: InvoiceListItem[];
  initialQuery: string;
  truncated?: boolean;
};

export function FuzzySearchPanel({
  customers,
  invoices,
  initialQuery,
  truncated = false,
}: Props) {
  const t = useTranslations("Search");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  const syncFromUrl = useEffectEvent((q: string) => {
    setValue(q);
  });

  useEffect(() => {
    syncFromUrl(initialQuery);
  }, [initialQuery]);

  const catalog = useMemo<CatalogHit[]>(
    () => [
      ...customers.map((item) => ({ kind: "customer" as const, item })),
      ...invoices.map((item) => ({ kind: "invoice" as const, item })),
    ],
    [customers, invoices],
  );

  const query = value.trim();
  const filtered = useFuzzySearch(catalog, query, {
    keys: [
      { name: "item.name", weight: 0.45 },
      { name: "item.ico", weight: 0.35 },
      { name: "item.dic", weight: 0.2 },
      { name: "item.email", weight: 0.25 },
      { name: "item.phone", weight: 0.15 },
      { name: "item.city", weight: 0.15 },
      { name: "item.number", weight: 0.5 },
      { name: "item.customerName", weight: 0.35 },
      { name: "item.status", weight: 0.1 },
      { name: "item.documentType", weight: 0.1 },
    ],
    threshold: 0.36,
    limit: 40,
    matchAllOnEmpty: false,
  });

  const customersHits = filtered.filter((h) => h.kind === "customer");
  const invoicesHits = filtered.filter((h) => h.kind === "invoice");

  const urlDebouncer = useDebouncer(
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
    <>
      <div
        className={cn(
          "mb-8 flex overflow-hidden rounded-[4px] border border-border bg-surface shadow-[0_1px_0_var(--rule)]",
          "focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/10",
        )}
      >
        <label className="relative flex min-w-0 flex-1 items-center">
          <span className="sr-only">{t("srLabel")}</span>
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
              urlDebouncer.maybeExecute(next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                urlDebouncer.flush();
              }
            }}
            placeholder={t("placeholder")}
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

      {!query ? (
        <FadeIn delay={0.1}>
          <SearchIdle />
        </FadeIn>
      ) : query.length < MIN_QUERY ? (
        <FadeIn delay={0.08}>
          <SearchTooShort />
        </FadeIn>
      ) : filtered.length === 0 ? (
        <FadeIn delay={0.08}>
          <SearchNoResults query={query} />
        </FadeIn>
      ) : (
        <FadeIn delay={0.08} className="space-y-8">
          <div className="ledger-strip">
            <span>
              {t("queryLabel")}{" "}
              <span className="text-ink">„{query}“</span>
            </span>
            <span className="data-num">
              {t("hits", { count: filtered.length })}
            </span>
            <span className="data-num">
              {t("hitBreakdown", {
                customers: customersHits.length,
                invoices: invoicesHits.length,
              })}
            </span>
            {truncated ? (
              <span className="text-faint">{t("catalogNote")}</span>
            ) : null}
          </div>

          <ResultGroup label={t("customers")} count={customersHits.length}>
            {customersHits.map(({ item }) => (
              <CustomerHit
                key={item.id}
                customer={item}
                badge={t("customer")}
              />
            ))}
          </ResultGroup>

          <ResultGroup label={t("invoices")} count={invoicesHits.length}>
            {invoicesHits.map(({ item }) => (
              <InvoiceHit
                key={item.id}
                invoice={item}
                locale={locale}
              />
            ))}
          </ResultGroup>
        </FadeIn>
      )}
    </>
  );
}

function ResultGroup({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </h2>
        <span className="data-num text-[12px] text-faint">{count}</span>
      </div>
      <ul className="panel divide-y divide-rule overflow-hidden">{children}</ul>
    </section>
  );
}

function CustomerHit({
  customer,
  badge,
}: {
  customer: Customer;
  badge: string;
}) {
  const meta = [customer.ico && `IČO ${customer.ico}`, customer.city, customer.email]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <Link
        href={`/customers/${customer.id}`}
        className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-raised/60"
      >
        <span
          aria-hidden
          className="stamp mt-0.5 shrink-0 border-muted text-muted-foreground"
        >
          Z
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink group-hover:underline">
            {customer.name}
          </p>
          {meta ? (
            <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
              {meta}
            </p>
          ) : null}
        </div>
        <p className="shrink-0 text-[12px] text-faint">{badge}</p>
      </Link>
    </li>
  );
}

function InvoiceHit({
  invoice,
  locale,
}: {
  invoice: InvoiceListItem;
  locale: AppLocale;
}) {
  return (
    <li>
      <Link
        href={`/invoices/${invoice.id}`}
        className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-raised/60"
      >
        <span aria-hidden className="stamp mt-0.5 shrink-0 border-ink text-ink">
          F
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-medium text-ink group-hover:underline">
              {invoice.number}
            </p>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
            {invoice.customerName}
          </p>
        </div>
        <div className="shrink-0 pt-0.5 text-right">
          <p className="money text-[14px] text-ink">
            {formatMoney(invoice.total, invoice.currency, locale)}
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {formatDate(invoice.issueDate, locale)}
          </p>
        </div>
      </Link>
    </li>
  );
}
