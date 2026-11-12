import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getPublicInvoice } from "@/features/invoices/api/public";
import { isApiError } from "@/shared/api/errors";
import { BrandLockup } from "@/shared/brand/brand-lockup";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import type { InvoiceParty } from "@/shared/api/types";
import {
  documentTypeLabel,
  emptyDash,
  formatDate,
  formatIban,
  formatMoney,
  paymentMethodLabel,
} from "@/shared/lib/format";
import type { AppLocale } from "@/i18n/routing";

function PartyBlock({
  title,
  party,
  labels,
}: {
  title: string;
  party: InvoiceParty;
  labels: { ico: string; dic: string; icDph: string };
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
      ) : null}
      {party.street ? <p className="text-muted-foreground">{party.street}</p> : null}
      <p className="text-muted-foreground">
        {[party.postalCode, party.city].filter(Boolean).join(" ") || "—"}
      </p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  try {
    const inv = await getPublicInvoice(token);
    return { title: `${inv.number} · Fakturio` };
  } catch {
    return { title: "Doklad · Fakturio" };
  }
}

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = await getTranslations("InvoiceDetail");
  const locale = (await getLocale()) as AppLocale;

  let invoice;
  try {
    invoice = await getPublicInvoice(token);
  } catch (e) {
    if (isApiError(e) && e.status === 404) notFound();
    throw e;
  }

  const showVat = invoice.sellerIsVatPayer !== false;
  const deliveryDate = invoice.deliveryDate ?? invoice.issueDate;
  const partyLabels = { ico: t("ico"), dic: t("dic"), icDph: t("icDph") };
  const pdfDownload = `/api/public/pdf/${token}?disposition=attachment`;
  const isdocDownload = `/api/public/isdoc/${token}?disposition=attachment`;

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <BrandLockup size="sm" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" asChild>
              <a href={pdfDownload}>PDF</a>
            </Button>
            <Button type="button" size="sm" variant="ghost" asChild>
              <a href={isdocDownload}>ISDOC</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
              {documentTypeLabel(invoice.documentType, locale)}
            </span>
            <StatusBadge status={invoice.status} />
            {invoice.isOverdue ? (
              <span className="text-[12px] font-medium text-negative">{t("overdue")}</span>
            ) : null}
          </div>
          <h1 className="data-num text-[28px] font-semibold tracking-tight">{invoice.number}</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">{invoice.customer.name}</p>
          <div className="ledger-strip mt-3">
            <span>
              {t("vs")} {emptyDash(invoice.variableSymbol)}
            </span>
            <span>
              {t("iban")} {formatIban(invoice.bankIban)}
            </span>
            <span className="money">{formatMoney(invoice.total, invoice.currency, locale)}</span>
          </div>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <PartyBlock title={t("seller")} party={invoice.seller} labels={partyLabels} />
          <PartyBlock title={t("buyer")} party={invoice.customer} labels={partyLabels} />
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="panel space-y-2 px-5 py-4 text-[13px]">
            <h2 className="text-[14px] font-medium text-ink">{t("dates")}</h2>
            <Row label={t("issueDate")} value={formatDate(invoice.issueDate, locale)} />
            <Row label={t("deliveryDate")} value={formatDate(deliveryDate, locale)} />
            <Row
              label={t("dueDateLabel")}
              value={formatDate(invoice.dueDate, locale)}
              danger={invoice.isOverdue}
            />
            {invoice.paidAt ? (
              <Row label={t("paidAt")} value={formatDate(invoice.paidAt, locale)} success />
            ) : null}
          </div>
          <div className="panel space-y-2 px-5 py-4 text-[13px]">
            <h2 className="text-[14px] font-medium text-ink">{t("payment")}</h2>
            <Row
              label={t("method")}
              value={paymentMethodLabel(invoice.paymentMethod, locale)}
            />
            <Row label={t("iban")} value={formatIban(invoice.bankIban)} />
            <Row label={t("vs")} value={emptyDash(invoice.variableSymbol)} />
          </div>
        </div>

        <div className="panel mb-6 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t("lineDescription")}</TableHead>
                <TableHead className="text-right">{t("lineQty")}</TableHead>
                <TableHead>{t("lineUnit")}</TableHead>
                <TableHead className="text-right">{t("linePrice")}</TableHead>
                {showVat ? (
                  <TableHead className="text-right">{t("lineVat")}</TableHead>
                ) : null}
                <TableHead className="text-right">{t("lineTotal")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="data-num text-right">{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="money text-right">
                    {formatMoney(item.unitPrice, invoice.currency, locale)}
                  </TableCell>
                  {showVat ? (
                    <TableCell className="data-num text-right">{item.vatRate}</TableCell>
                  ) : null}
                  <TableCell className="money text-right">
                    {formatMoney(item.total, invoice.currency, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="ml-auto max-w-xs space-y-1 text-[14px]">
          {showVat ? (
            <>
              <TotalRow label={t("subtotal")} value={formatMoney(invoice.subtotal, invoice.currency, locale)} />
              <TotalRow label={t("vat")} value={formatMoney(invoice.vatTotal, invoice.currency, locale)} />
            </>
          ) : null}
          <TotalRow
            label={t("grandTotal")}
            value={formatMoney(invoice.total, invoice.currency, locale)}
            strong
          />
        </p>

        {invoice.notes ? (
          <div className="panel mt-6 px-5 py-3">
            <p className="mb-1 text-[12px] font-medium text-ink">{t("notes")}</p>
            <p className="text-[14px] text-muted-foreground">{invoice.notes}</p>
          </div>
        ) : null}

        <p className="mt-10 text-center text-[11px] uppercase tracking-widest text-faint">
          Fakturio · verejný náhľad dokladu
        </p>
      </main>
    </div>
  );
}

function Row({
  label,
  value,
  danger,
  success,
}: {
  label: string;
  value: string;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          danger
            ? "data-num font-medium text-negative"
            : success
              ? "data-num font-medium text-positive"
              : "data-num text-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}

function TotalRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={
        strong
          ? "flex justify-between border-t border-border pt-2 text-[16px] font-bold"
          : "flex justify-between"
      }
    >
      <span className={strong ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className="money">{value}</span>
    </div>
  );
}
