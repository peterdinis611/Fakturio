import { Download } from "lucide-react";
import { Suspense } from "react";
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
import { SectionLoader } from "@/shared/ui/spinner";
import type {
  CompanySummary,
  DocumentFlow,
  InvoiceDocumentType,
  InvoiceListItem,
  InvoiceStatus,
  PagedResponse,
} from "@/shared/api/types";
import { invoicesExportHref } from "@/shared/lib/exports";

/** Client fuzzy search window — keep payload small for faster RSC. */
const CATALOG_SIZE = 100;

export type DocumentsCatalogSearchParams = {
  status?: string;
  type?: string;
  q?: string;
  overdue?: string;
};

export type DocumentsCatalogData = {
  data: PagedResponse<InvoiceListItem>;
  company: CompanySummary | null;
};

function parseFilters(
  flow: DocumentFlow,
  searchParams: DocumentsCatalogSearchParams,
) {
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
  return { status, documentType, search, overdueOnly };
}

/** Kick off catalog fetches before Suspense (safe to call from the page). */
export function loadDocumentsCatalog(
  flow: DocumentFlow,
  searchParams: DocumentsCatalogSearchParams,
): Promise<DocumentsCatalogData> {
  const { status, documentType, overdueOnly } = parseFilters(flow, searchParams);
  return Promise.all([
    listInvoices({
      page: 1,
      pageSize: CATALOG_SIZE,
      status,
      documentType,
      overdueOnly,
      flow,
    }),
    getCompanySummary().catch(() => null),
  ]).then(([data, company]) => ({ data, company }));
}

type Props = {
  flow: DocumentFlow;
  searchParams: DocumentsCatalogSearchParams;
  dataPromise: Promise<DocumentsCatalogData>;
};

async function DocumentsCatalogBody({ flow, searchParams, dataPromise }: Props) {
  const t = await getTranslations("Invoices");
  const td = await getTranslations("Documents");
  const tc = await getTranslations("Common");
  const { status, documentType, search, overdueOnly } = parseFilters(
    flow,
    searchParams,
  );
  const { data, company } = await dataPromise;
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
    <>
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
    </>
  );
}

/** Shell + Suspense body — preload via `loadDocumentsCatalog` on the page. */
export async function DocumentsCatalog({
  flow,
  searchParams,
  dataPromise,
}: Props) {
  const tl = await getTranslations("Loading");

  return (
    <div>
      <DocumentsAreaNav />
      <DocumentTypeNav
        flow={flow}
        activeType={
          searchParams.type && searchParams.type !== "all"
            ? (searchParams.type as InvoiceDocumentType)
            : undefined
        }
        activeStatus={
          searchParams.status && searchParams.status !== "all"
            ? (searchParams.status as InvoiceStatus)
            : undefined
        }
      />

      <Suspense
        fallback={
          <SectionLoader label={tl("invoices")} rows={8} className="mt-5" />
        }
      >
        <DocumentsCatalogBody
          flow={flow}
          searchParams={searchParams}
          dataPromise={dataPromise}
        />
      </Suspense>
    </div>
  );
}
