import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { searchGlobal } from "@/features/search/api/search";
import { FadeIn } from "@/shared/ui/motion/page-motion";
import {
  SearchNoResults,
  SearchTooShort,
} from "@/features/search/ui/search-empty";
import { StatusBadge } from "@/shared/ui/status-badge";
import type { SearchHit } from "@/shared/api/types";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

function isCustomer(hit: SearchHit) {
  return hit.type.toLowerCase() === "customer";
}

function HitRow({
  hit,
  typeLabel,
}: {
  hit: SearchHit;
  typeLabel: string;
}) {
  const customer = isCustomer(hit);
  const href = customer ? `/customers/${hit.id}` : `/invoices/${hit.id}`;
  const meta = [hit.subtitle, hit.number, hit.ico, hit.email]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <Link
        href={href}
        className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-raised/60"
      >
        <span
          aria-hidden
          className={cn(
            "stamp mt-0.5 shrink-0",
            customer
              ? "border-muted text-muted-foreground"
              : "border-ink text-ink",
          )}
        >
          {customer ? "Z" : "F"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-medium text-ink group-hover:underline">
              {hit.title}
            </p>
            {hit.status ? <StatusBadge status={hit.status} /> : null}
          </div>
          {meta ? (
            <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
              {meta}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 pt-0.5 text-right">
          {hit.amount != null ? (
            <p className="money text-[14px] text-ink">
              {formatMoney(hit.amount, hit.currency ?? "EUR")}
            </p>
          ) : null}
          {hit.issueDate ? (
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {formatDate(hit.issueDate)}
            </p>
          ) : (
            <p className="text-[12px] text-faint">{typeLabel}</p>
          )}
        </div>
      </Link>
    </li>
  );
}

function ResultGroup({
  label,
  count,
  hits,
  itemTypeLabel,
}: {
  label: string;
  count: number;
  hits: SearchHit[];
  itemTypeLabel: string;
}) {
  if (hits.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </h2>
        <span className="data-num text-[12px] text-faint">{count}</span>
      </div>
      <ul className="panel divide-y divide-rule overflow-hidden">
        {hits.map((hit) => (
          <HitRow
            key={`${hit.type}-${hit.id}`}
            hit={hit}
            typeLabel={itemTypeLabel}
          />
        ))}
      </ul>
    </section>
  );
}

export async function SearchResults({ query }: { query: string }) {
  const t = await getTranslations("Search");

  if (query.length < 2) {
    return (
      <FadeIn delay={0.08}>
        <SearchTooShort />
      </FadeIn>
    );
  }

  const result = await searchGlobal({ q: query, limit: 40 });
  const customers = result.hits.filter(isCustomer);
  const invoices = result.hits.filter((h) => !isCustomer(h));

  if (result.hits.length === 0) {
    return (
      <FadeIn delay={0.08}>
        <SearchNoResults query={query} />
      </FadeIn>
    );
  }

  return (
    <FadeIn delay={0.08} className="space-y-8">
      <div className="ledger-strip">
        <span>
          {t("queryStrip")}{" "}
          <span className="text-ink">„{result.query}“</span>
        </span>
        <span className="data-num">
          {t("hitsStrip", { count: result.totalHits })}
        </span>
        <span className="data-num">
          {t("breakdownStrip", {
            customers: customers.length,
            invoices: invoices.length,
          })}
        </span>
      </div>
      <ResultGroup
        label={t("customers")}
        count={customers.length}
        hits={customers}
        itemTypeLabel={t("customer")}
      />
      <ResultGroup
        label={t("invoices")}
        count={invoices.length}
        hits={invoices}
        itemTypeLabel={t("invoice")}
      />
    </FadeIn>
  );
}
