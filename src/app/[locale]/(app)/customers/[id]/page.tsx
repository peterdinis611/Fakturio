import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomer } from "@/features/customers/api/customers";
import { listInvoices } from "@/features/invoices/api/invoices";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { StatusBadge } from "@/shared/ui/status-badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { emptyDash, formatDate, formatMoney } from "@/shared/lib/format";
import { isApiError } from "@/shared/api/errors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const c = await getCustomer(id);
    return { title: c.name };
  } catch {
    return { title: "Zákazník" };
  }
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let customer;
  try {
    customer = await getCustomer(id);
  } catch (e) {
    if (isApiError(e) && e.status === 404) notFound();
    throw e;
  }

  const invoices = await listInvoices({
    customerId: id,
    pageSize: 20,
  });

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={[customer.city, customer.country].filter(Boolean).join(" · ")}
        ledger={
          <>
            <span>IČO {emptyDash(customer.ico)}</span>
            <span>DIČ {emptyDash(customer.dic)}</span>
            <span className="data-num">{customer.invoiceCount} faktúr</span>
          </>
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/customers/${id}/edit`}>Upraviť</Link>
            </Button>
            <Button asChild>
              <Link href={`/invoices/new?customerId=${id}`}>Nová faktúra</Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="panel space-y-2 px-4 py-4 text-sm">
          <h2 className="text-[14px] font-medium text-ink">Kontakt</h2>
          <p>{emptyDash(customer.email)}</p>
          <p>{emptyDash(customer.phone)}</p>
        </div>
        <div className="panel space-y-2 px-4 py-4 text-sm">
          <h2 className="text-[14px] font-medium text-ink">Adresa</h2>
          <p>{emptyDash(customer.street)}</p>
          <p>
            {emptyDash(customer.postalCode)} {emptyDash(customer.city)}
          </p>
          <p>{customer.country}</p>
        </div>
      </div>

      <h2 className="mb-3 text-[15px] font-medium text-ink">Faktúry</h2>
      {invoices.items.length === 0 ? (
        <p className="panel px-4 py-6 text-sm text-muted-foreground">
          Zatiaľ žiadne faktúry pre tohto zákazníka.
        </p>
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Číslo</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Vystavené</TableHead>
                <TableHead className="text-right">Suma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.items.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="data-num hover:underline"
                    >
                      {inv.number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell>{formatDate(inv.issueDate)}</TableCell>
                  <TableCell className="data-num text-right">
                    {formatMoney(inv.total, inv.currency)}
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
