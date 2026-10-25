import Link from "next/link";
import { searchGlobal } from "@/actions/search";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata = { title: "Hľadanie" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const result =
    query.length >= 2 ? await searchGlobal({ q: query, limit: 40 }) : null;

  return (
    <div>
      <PageHeader
        title="Hľadanie"
        description="Zákazníci a faktúry naraz: min. 2 znaky."
        ledger={
          result ? (
            <>
              <span>Dotaz „{result.query}“</span>
              <span className="data-num">{result.totalHits} zásahov</span>
            </>
          ) : (
            <span>Globálne /api/search</span>
          )
        }
      />

      <form className="mb-6 flex max-w-xl gap-2" action="/search">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Meno, IČO, číslo faktúry…"
          className="rounded-none"
          autoFocus
        />
        <Button type="submit">Hľadať</Button>
      </form>

      {!query ? (
        <p className="panel px-4 py-8 text-sm text-muted-foreground">
          Zadaj dopyt: prehľadáva zákazníkov aj faktúry.
        </p>
      ) : query.length < 2 ? (
        <p className="panel px-4 py-8 text-sm text-muted-foreground">
          Zadaj aspoň 2 znaky.
        </p>
      ) : result && result.hits.length === 0 ? (
        <p className="panel px-4 py-8 text-sm text-muted-foreground">
          Nič sa nenašlo pre „{query}“.
        </p>
      ) : (
        <ul className="panel divide-y divide-border">
          {result?.hits.map((hit) => {
            const href =
              hit.type.toLowerCase() === "customer"
                ? `/customers/${hit.id}`
                : `/invoices/${hit.id}`;
            return (
              <li key={`${hit.type}-${hit.id}`}>
                <Link
                  href={href}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-muted-foreground">
                        {hit.type === "customer" || hit.type === "Customer"
                          ? "Zákazník"
                          : "Faktúra"}
                      </span>
                      {hit.status ? <StatusBadge status={hit.status} /> : null}
                    </div>
                    <p className="font-medium">{hit.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[hit.subtitle, hit.number, hit.ico, hit.email]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {hit.amount != null ? (
                      <p className="data-num">
                        {formatMoney(hit.amount, hit.currency ?? "EUR")}
                      </p>
                    ) : null}
                    {hit.issueDate ? (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(hit.issueDate)}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
