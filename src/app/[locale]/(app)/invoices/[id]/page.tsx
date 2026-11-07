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
import type { InvoiceParty } from "@/shared/api/types";
import {
  documentTypeLabel,
  emptyDash,
  formatDate,
  formatIban,
  formatMoney,
  paymentMethodLabel,
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

function PartyBlock({
  title,
  party,
  labels,
  notVatPayer,
  showNotVatPayer,
}: {
  title: string;
  party: InvoiceParty;
  labels: { ico: string; dic: string; icDph: string };
  notVatPayer?: string;
  showNotVatPayer?: boolean;
}) {
  return (
    <div className="panel space-y-1 px-5 py-4 text-[14px]">
      <h2 className="mb-2 text-[14px] font-medium text-ink">{title}</h2>
      <p className="font-medium">{party.name || "—"}</p>
      <p className="data-num text-[12px] text-muted-foreground">
        {labels.ico} {emptyDash(party.ico)}
      </p>
      {party.dic ? (
        <p className="data-num text-[12px] text-muted-foreground">
          {labels.dic} {party.dic}
        </p>
      ) : null}
      {party.icDph ? (
        <p className="data-num text-[12px] text-muted-foreground">
          {labels.icDph} {party.icDph}
        </p>
      ) : showNotVatPayer && notVatPayer ? (
        <p className="text-[12px] text-muted-foreground">{notVatPayer}</p>
      ) : null}
      {party.street ? (
        <p className="text-muted-foreground">{party.street}</p>
      ) : null}
      <p className="text-muted-foreground">
        {[party.postalCode, party.city].filter(Boolean).join(" ") || "—"}
      </p>
      {party.country && party.country !== "SK" ? (
        <p className="text-muted-foreground">{party.country}</p>
      ) : null}
      {party.email ? (
        <p className="text-[12px] text-muted-foreground">{party.email}</p>
      ) : null}
    </div>
  );
}

function MetaRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger" | "success";
}) {
  const valueClass =
    tone === "danger"
      ? "data-num font-medium text-negative"
      : tone === "success"
        ? "data-num font-medium text-positive"
        : "data-num text-ink";
  return (
    <div className="flex justify-between gap-3 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
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
  const deliveryDate = invoice.deliveryDate ?? invoice.issueDate;
  const partyLabels = {
    ico: t("ico"),
    dic: t("dic"),
    icDph: t("icDph"),
  };

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
            {invoice.customer.name}
          </p>
          {invoice.relatedInvoiceId && invoice.relatedInvoiceNumber ? (
            <p className="mt-1 text-[13px] text-muted-foreground">
              {t("relatedDoc")}{" "}
              <Link
                href={`/invoices/${invoice.relatedInvoiceId}`}
                className="data-num font-medium text-ink hover:underline"
              >
                {invoice.relatedInvoiceNumber}
              </Link>
            </p>
          ) : null}
          <div className="ledger-strip mt-3 mb-0">
            <span>
              {t("vs")} {emptyDash(invoice.variableSymbol)}
            </span>
            {invoice.constantSymbol ? (
              <span>
                {t("ks")} {invoice.constantSymbol}
              </span>
            ) : null}
            {invoice.specificSymbol ? (
              <span>
                {t("ss")} {invoice.specificSymbol}
              </span>
            ) : null}
            <span>
              {t("iban")} {formatIban(invoice.bankIban)}
            </span>
            <span
              className={
                invoice.isOverdue
                  ? "money text-negative"
                  : "money text-ink"
              }
            >
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

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        {invoice.seller ? (
          <PartyBlock
            title={t("seller")}
            party={invoice.seller}
            labels={partyLabels}
            notVatPayer={t("notVatPayer")}
            showNotVatPayer={!showVat}
          />
        ) : (
          <div className="panel px-5 py-4 text-[14px] text-muted-foreground">
            <h2 className="mb-2 text-[14px] font-medium text-ink">
              {t("seller")}
            </h2>
            <p>—</p>
          </div>
        )}
        <PartyBlock
          title={t("buyer")}
          party={invoice.customer}
          labels={partyLabels}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="panel space-y-2 px-5 py-4">
          <h2 className="mb-1 text-[14px] font-medium text-ink">{t("dates")}</h2>
          <MetaRow
            label={t("issueDate")}
            value={formatDate(invoice.issueDate, locale)}
          />
          <MetaRow
            label={t("deliveryDate")}
            value={formatDate(deliveryDate, locale)}
          />
          <MetaRow
            label={t("dueDateLabel")}
            value={formatDate(invoice.dueDate, locale)}
            tone={invoice.isOverdue ? "danger" : "default"}
          />
          {invoice.paidAt ? (
            <MetaRow
              label={t("paidAt")}
              value={formatDate(invoice.paidAt, locale)}
              tone="success"
            />
          ) : null}
          {invoice.cancelReason ? (
            <p className="pt-1 text-[13px] text-negative">
              {invoice.cancelReason}
              {invoice.cancelledAt
                ? ` · ${formatDate(invoice.cancelledAt, locale)}`
                : ""}
            </p>
          ) : null}
        </div>

        <div className="panel space-y-2 px-5 py-4">
          <h2 className="mb-1 text-[14px] font-medium text-ink">
            {t("payment")}
          </h2>
          <MetaRow
            label={t("method")}
            value={paymentMethodLabel(invoice.paymentMethod, locale)}
          />
          <MetaRow label={t("iban")} value={formatIban(invoice.bankIban)} />
          <MetaRow label={t("bic")} value={emptyDash(invoice.bankBic)} />
          <MetaRow
            label={t("vs")}
            value={emptyDash(invoice.variableSymbol)}
          />
          {invoice.constantSymbol ? (
            <MetaRow label={t("ks")} value={invoice.constantSymbol} />
          ) : null}
          {invoice.specificSymbol ? (
            <MetaRow label={t("ss")} value={invoice.specificSymbol} />
          ) : null}
        </div>
      </div>

      <div className="panel mb-6 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[12px] text-muted-foreground">
                {t("lineDescription")}
              </TableHead>
              <TableHead className="text-right text-[12px] text-muted-foreground">
                {t("lineQty")}
              </TableHead>
              <TableHead className="text-[12px] text-muted-foreground">
                {t("lineUnit")}
              </TableHead>
              <TableHead className="text-right text-[12px] text-muted-foreground">
                {t("linePrice")}
              </TableHead>
              {showVat ? (
                <TableHead className="text-right text-[12px] text-muted-foreground">
                  {t("lineVat")}
                </TableHead>
              ) : null}
              <TableHead className="text-right text-[12px] text-muted-foreground">
                {t("lineTotal")}
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
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="money">
                {formatMoney(invoice.subtotal, invoice.currency, locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("vat")}</span>
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
          <span className="font-medium">{t("grandTotal")}</span>
          <span className="money font-bold">
            {formatMoney(invoice.total, invoice.currency, locale)}
          </span>
        </div>
      </div>

      {invoice.notes ? (
        <div className="panel mt-6 px-5 py-3">
          <p className="mb-1 text-[12px] font-medium text-ink">{t("notes")}</p>
          <p className="text-[14px] text-muted-foreground">{invoice.notes}</p>
        </div>
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
