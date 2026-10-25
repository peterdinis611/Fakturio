import Link from "next/link";
import { Search } from "lucide-react";
import { searchGlobal } from "@/actions/search";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/page-motion";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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
            customer ? "border-muted text-muted-foreground" : "border-ink text-ink",
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
        <form
          action="/search"
          className="mb-8 flex overflow-hidden rounded-[4px] border border-border bg-surface shadow-[0_1px_0_var(--rule)] focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/10"
        >
          <label className="relative flex min-w-0 flex-1 items-center">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 size-4 text-faint"
            />
            <input
              name="q"
              defaultValue={query}
              placeholder="Meno, IČO, číslo faktúry…"
              autoFocus
              autoComplete="off"
              className="h-12 w-full bg-transparent pr-3 pl-10 text-[15px] text-ink outline-none placeholder:text-faint"
            />
          </label>
          <Button
            type="submit"
            className="h-12 shrink-0 rounded-none px-5 text-[14px]"
          >
            Hľadať
          </Button>
        </form>
      </FadeIn>

      {!query ? (
        <FadeIn delay={0.1}>
          <div className="border-t border-rule pt-6">
            <p className="text-[14px] text-muted-foreground">
              Začni písať — prehľadá meno, IČO, email aj číslo faktúry.
            </p>
            <ul className="mt-4 grid gap-2 text-[13px] text-faint sm:grid-cols-3">
              <li className="border border-dashed border-border px-3 py-2.5">
                <span className="text-muted-foreground">Príklad</span>
                <p className="mt-0.5 text-ink">Acme</p>
              </li>
              <li className="border border-dashed border-border px-3 py-2.5">
                <span className="text-muted-foreground">Príklad</span>
                <p className="mt-0.5 font-mono text-ink">12345678</p>
              </li>
              <li className="border border-dashed border-border px-3 py-2.5">
                <span className="text-muted-foreground">Príklad</span>
                <p className="mt-0.5 font-mono text-ink">2026-001</p>
              </li>
            </ul>
          </div>
        </FadeIn>
      ) : query.length < 2 ? (
        <FadeIn delay={0.08}>
          <p className="border-t border-rule pt-6 text-[14px] text-warning">
            Zadaj aspoň 2 znaky.
          </p>
        </FadeIn>
      ) : result && result.hits.length === 0 ? (
        <FadeIn delay={0.08}>
          <div className="border-t border-rule pt-6">
            <p className="text-[16px] font-medium text-ink">Nič sa nenašlo</p>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Pre „{query}“ nie sú zhody medzi zákazníkmi ani faktúrami.
            </p>
          </div>
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
