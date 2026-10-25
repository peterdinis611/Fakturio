import Link from "next/link";
import { listCustomers } from "@/actions/customers";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { emptyDash } from "@/lib/format";

export const metadata = { title: "Zákazníci" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const search = sp.q?.trim() || undefined;
  const data = await listCustomers({ page, pageSize: 20, search });

  return (
    <div>
      <PageHeader
        title="Zákazníci"
        description={`${data.totalCount} odberateľov: IČO a adresa idú do faktúry.`}
        actions={
          <Button asChild>
            <Link href="/customers/new">Pridať zákazníka</Link>
          </Button>
        }
      />

      <form className="mb-4 flex max-w-sm gap-2" action="/customers">
        <input
          name="q"
          defaultValue={search}
          placeholder="Meno, IČO, email…"
          className="h-9 flex-1 rounded-[6px] border border-control bg-surface px-3 text-[14px] outline-none focus:ring-2 focus:ring-ink/15"
        />
        <Button type="submit" variant="secondary">
          Hľadať
        </Button>
      </form>

      {data.items.length === 0 ? (
        <EmptyState
          title="Žiadni zákazníci"
          description="Pridaj odberateľa pred vystavením faktúry."
          actionLabel="Pridať zákazníka"
          actionHref="/customers/new"
        />
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px] text-muted-foreground">
                  Názov
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  IČO
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  Mesto
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="text-right text-[12px] text-muted-foreground">
                  Faktúry
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((c) => (
                <TableRow key={c.id} className="h-11">
                  <TableCell>
                    <Link
                      href={`/customers/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="data-num text-[13px]">
                    {emptyDash(c.ico)}
                  </TableCell>
                  <TableCell>{emptyDash(c.city)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {emptyDash(c.email)}
                  </TableCell>
                  <TableCell className="data-num text-right">
                    {c.invoiceCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
