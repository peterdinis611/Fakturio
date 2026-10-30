import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getInvoice } from "@/features/invoices/api/invoices";
import { InvoiceActions } from "@/features/invoices/ui/invoice-actions";
import { XmlPreview } from "@/widgets/preview/xml-preview";
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
import { isApiError } from "@/shared/api/errors";
import {
  documentTypeLabel,
  emptyDash,
  formatDate,
  formatMoney,
} from "@/shared/lib/format";
import { buildInvoiceXml } from "@/shared/lib/preview/invoice-xml";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Search");
  try {
    const inv = await getInvoice(id);
    return { title: inv.number };
  } catch {
    return { title: t("invoice") };
  }
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("InvoiceDetail");
  const te = await getTranslations("CustomerDetail");
  const locale = (await getLocale()) as AppLocale;
  let invoice;
  try {
    invoice = await getInvoice(id);
  } catch (e) {
    if (isApiError(e) && e.status === 404) notFound();
    throw e;
  }

  const showVat = invoice.sellerIsVatPayer !== false;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
              {documentTypeLabel(invoice.documentType, locale)}
            </span>
            <StatusBadge status={invoice.status} />
            {invoice.isOverdue ? (
              <span className="text-[12px] font-medium text-negative">
                {t("overdue")}
              </span>
            ) : null}
          </div>
          <h1 className="data-num text-[24px] font-semibold tracking-tight text-ink">
            {invoice.number}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {invoice.customer.name} ·{" "}
            <span className={invoice.isOverdue ? "text-negative" : undefined}>
              {formatDate(invoice.dueDate, locale)}
            </span>
          </p>
          {invoice.relatedInvoiceId && invoice.relatedInvoiceNumber ? (
            <p className="mt-1 text-[13px] text-muted-foreground">
              K dokladu{" "}
              <Link
                href={`/invoices/${invoice.relatedInvoiceId}`}
                className="data-num font-medium text-ink hover:underline"
              >
                {invoice.relatedInvoiceNumber}
              </Link>
            </p>
          ) : null}
          {/* Signature: platobný pás */}
          <div className="ledger-strip mt-3 mb-0">
            <span>VS {emptyDash(invoice.variableSymbol)}</span>
            <span>IBAN {emptyDash(invoice.bankIban)}</span>
            <span className="money text-ink">
              {formatMoney(invoice.total, invoice.currency, locale)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {invoice.status === "Draft" ? (
            <Button asChild variant="outline">
              <Link href={`/invoices/${id}/edit`}>{te("edit")}</Link>
            </Button>
          ) : null}
          <InvoiceActions invoice={invoice} />
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="panel space-y-1 px-5 py-4 text-[14px]">
          <h2 className="mb-2 text-[14px] font-medium text-ink">{t("buyer")}</h2>
          <p className="font-medium">{invoice.customer.name}</p>
          <p className="data-num text-[12px] text-muted-foreground">
            IČO {emptyDash(invoice.customer.ico)}
          </p>
          <p className="text-muted-foreground">
            {emptyDash(invoice.customer.street)}
          </p>
          <p className="text-muted-foreground">
            {emptyDash(invoice.customer.postalCode)}{" "}
            {emptyDash(invoice.customer.city)}
          </p>
        </div>
        <div className="panel space-y-1 px-5 py-4 text-[14px]">
          <h2 className="mb-2 text-[14px] font-medium text-ink">{t("payment")}</h2>
          <p>Metóda: {emptyDash(invoice.paymentMethod)}</p>
          <p className="data-num text-[12px]">
            IBAN {emptyDash(invoice.bankIban)}
          </p>
          <p className="data-num text-[12px]">
            BIC {emptyDash(invoice.bankBic)}
          </p>
          <p className="text-muted-foreground">
            Vystavené {formatDate(invoice.issueDate, locale)}
          </p>
          {invoice.paidAt ? (
            <p className="text-positive">
              Zaplatené {formatDate(invoice.paidAt, locale)}
            </p>
          ) : null}
          {invoice.cancelReason ? (
            <p className="text-negative">Zrušené: {invoice.cancelReason}</p>
          ) : null}
        </div>
      </div>

      <div className="panel mb-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[12px] text-muted-foreground">
                Popis
              </TableHead>
              <TableHead className="text-right text-[12px] text-muted-foreground">
                Množ.
              </TableHead>
              <TableHead className="text-[12px] text-muted-foreground">
                MJ
              </TableHead>
              <TableHead className="text-right text-[12px] text-muted-foreground">
                Cena
              </TableHead>
              {showVat ? (
                <TableHead className="text-right text-[12px] text-muted-foreground">
                  DPH %
                </TableHead>
              ) : null}
              <TableHead className="text-right text-[12px] text-muted-foreground">
                Spolu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="data-num text-right">
                  {item.quantity}
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="money text-right">
                  {formatMoney(item.unitPrice, invoice.currency, locale)}
                </TableCell>
                {showVat ? (
                  <TableCell className="data-num text-right">
                    {item.vatRate}
                  </TableCell>
                ) : null}
                <TableCell className="money text-right">
                  {formatMoney(item.total, invoice.currency, locale)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="ml-auto max-w-xs space-y-1 text-[14px]">
        {showVat ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Základ</span>
              <span className="money">
                {formatMoney(invoice.subtotal, invoice.currency, locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DPH</span>
              <span className="money">
                {formatMoney(invoice.vatTotal, invoice.currency, locale)}
              </span>
            </div>
          </>
        ) : (
          <p className="mb-2 text-[12px] text-muted-foreground">
            {t("notVatPayer")}
          </p>
        )}
        <div className="flex justify-between border-t border-border pt-2 text-[16px]">
          <span className="font-medium">Celkom</span>
          <span className="money font-bold">
            {formatMoney(invoice.total, invoice.currency, locale)}
          </span>
        </div>
      </div>

      {invoice.notes ? (
        <p className="panel mt-6 px-5 py-3 text-[14px] text-muted-foreground">
          {invoice.notes}
        </p>
      ) : null}

      {invoice.status !== "Draft" ? (
        <div className="mt-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[16px] font-medium text-ink">{t("documents")}</h2>
            <XmlPreview
              title={`XML · ${invoice.number}`}
              description={t("xmlPreview")}
              xml={buildInvoiceXml(invoice)}
              fileName={`${invoice.number}.xml`}
              triggerVariant="outline"
            />
          </div>
          <iframe
            title={`PDF ${invoice.number}`}
            src={`/api/pdf/${invoice.id}?disposition=inline`}
            className="panel h-[70vh] w-full"
          />
        </div>
      ) : null}
    </div>
  );
}
