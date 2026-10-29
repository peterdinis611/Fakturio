import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoice } from "@/actions/invoices";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { XmlPreview } from "@/components/preview/xml-preview";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isApiError } from "@/lib/api/errors";
import {
  documentTypeLabel,
  emptyDash,
  formatDate,
  formatMoney,
} from "@/lib/format";
import { buildInvoiceXml } from "@/lib/preview/invoice-xml";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const inv = await getInvoice(id);
    return { title: inv.number };
  } catch {
    return { title: "Faktúra" };
  }
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
              {documentTypeLabel(invoice.documentType)}
            </span>
            <StatusBadge status={invoice.status} />
            {invoice.isOverdue ? (
              <span className="text-[12px] font-medium text-negative">
                Po splatnosti
              </span>
            ) : null}
          </div>
          <h1 className="data-num text-[24px] font-semibold tracking-tight text-ink">
            {invoice.number}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {invoice.customer.name} · splatnosť{" "}
            <span className={invoice.isOverdue ? "text-negative" : undefined}>
              {formatDate(invoice.dueDate)}
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
              {formatMoney(invoice.total, invoice.currency)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {invoice.status === "Draft" ? (
            <Button asChild variant="outline">
              <Link href={`/invoices/${id}/edit`}>Upraviť</Link>
            </Button>
          ) : null}
          <InvoiceActions invoice={invoice} />
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="panel space-y-1 px-5 py-4 text-[14px]">
          <h2 className="mb-2 text-[14px] font-medium text-ink">Odberateľ</h2>
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
          <h2 className="mb-2 text-[14px] font-medium text-ink">Platba</h2>
          <p>Metóda: {emptyDash(invoice.paymentMethod)}</p>
          <p className="data-num text-[12px]">
            IBAN {emptyDash(invoice.bankIban)}
          </p>
          <p className="data-num text-[12px]">
            BIC {emptyDash(invoice.bankBic)}
          </p>
          <p className="text-muted-foreground">
            Vystavené {formatDate(invoice.issueDate)}
          </p>
          {invoice.paidAt ? (
            <p className="text-positive">Zaplatené {formatDate(invoice.paidAt)}</p>
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
                  {formatMoney(item.unitPrice, invoice.currency)}
                </TableCell>
                {showVat ? (
                  <TableCell className="data-num text-right">
                    {item.vatRate}
                  </TableCell>
                ) : null}
                <TableCell className="money text-right">
                  {formatMoney(item.total, invoice.currency)}
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
                {formatMoney(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DPH</span>
              <span className="money">
                {formatMoney(invoice.vatTotal, invoice.currency)}
              </span>
            </div>
          </>
        ) : (
          <p className="mb-2 text-[12px] text-muted-foreground">
            Nie som platca DPH
          </p>
        )}
        <div className="flex justify-between border-t border-border pt-2 text-[16px]">
          <span className="font-medium">Celkom</span>
          <span className="money font-bold">
            {formatMoney(invoice.total, invoice.currency)}
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
            <h2 className="text-[16px] font-medium text-ink">Dokumenty</h2>
            <XmlPreview
              title={`XML · ${invoice.number}`}
              description="Štruktúrovaný náhľad faktúry pred stiahnutím."
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
