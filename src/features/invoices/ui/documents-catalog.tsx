import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCompanySummary } from "@/features/company/api/company";
import { InvoiceReadyLink } from "@/features/company/ui/invoice-ready-link";
import { listInvoices } from "@/features/invoices/api/invoices";
import { newDocumentHref } from "@/features/invoices/lib/document-href";
import { DocumentsAreaNav } from "@/features/invoices/ui/documents-area-nav";
import { DocumentTypeNav } from "@/features/invoices/ui/document-type-nav";
import {
  InvoiceFilters,
  InvoiceLifecycleHint,
} from "@/features/invoices/ui/invoice-filters";
import { InvoicesFuzzyTable } from "@/features/invoices/ui/invoices-fuzzy-table";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { CsvPreview } from "@/widgets/preview/csv-preview";
import { Button } from "@/shared/ui/button";
import type {
  DocumentFlow,
  InvoiceDocumentType,
  InvoiceStatus,
} from "@/shared/api/types";
import { invoicesExportHref } from "@/shared/lib/exports";

/** Client fuzzy search window — keep payload small for faster RSC. */
const CATALOG_SIZE = 100;

type Props = {
  flow: DocumentFlow;
  searchParams: {
    status?: string;
    type?: string;
    q?: string;
    overdue?: string;
  };
};

export async function DocumentsCatalog({ flow, searchParams }: Props) {
  const t = await getTranslations("Invoices");
  const td = await getTranslations("Documents");
  const tc = await getTranslations("Common");

  const status =
    searchParams.status && searchParams.status !== "all"
      ? (searchParams.status as InvoiceStatus)
      : undefined;
  const documentType =
    searchParams.type && searchParams.type !== "all"
      ? (searchParams.type as InvoiceDocumentType)
      : undefined;
  const search = searchParams.q?.trim() || "";
  const overdueOnly = searchParams.overdue === "1" && flow === "Issued";

  const [data, company] = await Promise.all([
    listInvoices({
      page: 1,
      pageSize: CATALOG_SIZE,
      status,
      documentType,
      overdueOnly,
      flow,
    }),
    getCompanySummary().catch(() => null),
  ]);
  const ready = company?.isReadyToInvoice ?? false;
  const create = newDocumentHref(flow, documentType, status);

  const title =
    flow === "Received"
      ? td("expenses")
      : documentType
        ? td(
            documentType === "Proforma"
              ? "Proforma"
              : documentType === "CreditNote"
                ? "CreditNote"
                : documentType === "Quote"
                  ? "Quote"
                  : documentType === "DeliveryNote"
                    ? "DeliveryNote"
                    : documentType === "SalesOrder"
                      ? "SalesOrder"
                      : "Invoice",
          )
        : status === "Draft"
          ? td("Drafts")
          : t("title");

  return (
    <div>
      <DocumentsAreaNav />
      <DocumentTypeNav
        flow={flow}
        activeType={documentType}
        activeStatus={status}
      />

      <div className="mt-5">
        <PageHeader
          title={title}
          description={<InvoiceLifecycleHint overdueOnly={overdueOnly} />}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {flow === "Issued" ? (
                <>
                  <CsvPreview
                    href={invoicesExportHref({ status })}
                    title={t("csvTitle")}
                    description={
                      status ? t("csvFiltered", { status }) : t("csvAll")
                    }
                  />
                  <Button asChild variant="ghost" size="sm">
                    <a href={invoicesExportHref({ status })} download>
                      <Download className="size-3.5" aria-hidden />
                      {tc("download")}
                    </a>
                  </Button>
                </>
              ) : null}
              {create ? (
                <InvoiceReadyLink href={create.href} ready={ready}>
                  {td(create.labelKey)}
                </InvoiceReadyLink>
              ) : (
                <p className="max-w-[14rem] text-[12px] text-muted-foreground">
                  {td("creditNoteHint")}
                </p>
              )}
            </div>
          }
        />
      </div>

      <InvoiceFilters
        status={status}
        documentType={documentType}
        overdueOnly={overdueOnly}
        basePath={flow === "Received" ? "/expenses" : "/invoices"}
      />

      <InvoicesFuzzyTable
        items={data.items}
        initialQuery={search}
        status={status}
        documentType={documentType}
        overdueOnly={overdueOnly}
        truncated={data.totalCount > data.items.length}
        canCreate={ready && Boolean(create)}
        newHref={create?.href}
      />
    </div>
  );
}
