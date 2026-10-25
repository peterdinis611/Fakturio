import Link from "next/link";
import { searchGlobal } from "@/actions/search";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/page-motion";
import { SearchBox } from "@/components/search/search-box";
import {
  SearchIdle,
  SearchNoResults,
  SearchTooShort,
} from "@/components/search/search-empty";
import { StatusBadge } from "@/components/shared/status-badge";
import type { SearchHit } from "@/lib/api/types";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Hľadanie" };

function isCustomer(hit: SearchHit) {
  return hit.type.toLowerCase() === "customer";
}

function HitRow({ hit }: { hit: SearchHit }) {
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
            <p className="text-[12px] text-faint">
              {customer ? "Zákazník" : "Faktúra"}
            </p>
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
}: {
  label: string;
  count: number;
  hits: SearchHit[];
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
          <HitRow key={`${hit.type}-${hit.id}`} hit={hit} />
        ))}
      </ul>
    </section>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const result =
    query.length >= 2 ? await searchGlobal({ q: query, limit: 40 }) : null;

  const customers = result?.hits.filter(isCustomer) ?? [];
  const invoices = result?.hits.filter((h) => !isCustomer(h)) ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Hľadanie"
        description="Zákazníci a faktúry naraz — aspoň 2 znaky."
        ledger={
          result ? (
            <>
              <span>
                Dotaz <span className="text-ink">„{result.query}“</span>
              </span>
              <span className="data-num">{result.totalHits} zásahov</span>
              <span className="data-num">
                {customers.length} zákazníkov · {invoices.length} faktúr
              </span>
            </>
          ) : undefined
        }
      />

      <FadeIn delay={0.05}>
        <SearchBox initialQuery={query} />
      </FadeIn>

      {!query ? (
        <FadeIn delay={0.1}>
          <SearchIdle />
        </FadeIn>
      ) : query.length < 2 ? (
        <FadeIn delay={0.08}>
          <SearchTooShort />
        </FadeIn>
      ) : result && result.hits.length === 0 ? (
        <FadeIn delay={0.08}>
          <SearchNoResults query={query} />
        </FadeIn>
      ) : (
        <FadeIn delay={0.08} className="space-y-8">
          <ResultGroup
            label="Zákazníci"
            count={customers.length}
            hits={customers}
          />
          <ResultGroup
            label="Faktúry"
            count={invoices.length}
            hits={invoices}
          />
        </FadeIn>
      )}
    </div>
  );
}
