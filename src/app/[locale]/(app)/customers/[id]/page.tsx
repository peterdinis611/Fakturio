import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
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
import { countryLabel } from "@/shared/lib/countries";
import { emptyDash, formatDate, formatMoney } from "@/shared/lib/format";
import { isApiError } from "@/shared/api/errors";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Search");
  try {
    const c = await getCustomer(id);
    return { title: c.name };
  } catch {
    return { title: t("customer") };
  }
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("CustomerDetail");
  const ti = await getTranslations("Invoices");
  const locale = (await getLocale()) as AppLocale;
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
        description={[customer.city, countryLabel(customer.country)]
          .filter(Boolean)
          .join(" · ")}
        ledger={
          <>
            <span>IČO {emptyDash(customer.ico)}</span>
            <span>DIČ {emptyDash(customer.dic)}</span>
            <span className="data-num">{customer.invoiceCount}</span>
          </>
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/customers/${id}/edit`}>{t("edit")}</Link>
            </Button>
            <Button asChild>
              <Link href={`/invoices/new?customerId=${id}`}>{t("newInvoice")}</Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="panel space-y-2 px-4 py-4 text-sm">
          <h2 className="text-[14px] font-medium text-ink">{t("contact")}</h2>
          <p>{emptyDash(customer.email)}</p>
          <p>{emptyDash(customer.phone)}</p>
        </div>
        <div className="panel space-y-2 px-4 py-4 text-sm">
          <h2 className="text-[14px] font-medium text-ink">{t("address")}</h2>
          <p>{emptyDash(customer.street)}</p>
          <p>
            {emptyDash(customer.postalCode)} {emptyDash(customer.city)}
          </p>
          <p>{countryLabel(customer.country)}</p>
        </div>
      </div>

      <h2 className="mb-3 text-[15px] font-medium text-ink">{t("invoices")}</h2>
      {invoices.items.length === 0 ? (
        <p className="panel px-4 py-6 text-sm text-muted-foreground">
          {t("noInvoices")}
        </p>
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ti("colNumber")}</TableHead>
                <TableHead>{ti("colStatus")}</TableHead>
                <TableHead>{ti("colIssued")}</TableHead>
                <TableHead className="text-right">{ti("colAmount")}</TableHead>
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
                  <TableCell>{formatDate(inv.issueDate, locale)}</TableCell>
                  <TableCell className="data-num text-right">
                    {formatMoney(inv.total, inv.currency, locale)}
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
