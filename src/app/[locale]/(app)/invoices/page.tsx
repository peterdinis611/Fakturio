import Link from "next/link";
import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { listInvoices } from "@/features/invoices/api/invoices";
import {
  InvoiceFilters,
  InvoiceLifecycleHint,
} from "@/features/invoices/ui/invoice-filters";
import { InvoicesFuzzyTable } from "@/features/invoices/ui/invoices-fuzzy-table";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { CsvPreview } from "@/widgets/preview/csv-preview";
import { Button } from "@/shared/ui/button";
import type { InvoiceDocumentType, InvoiceStatus } from "@/shared/api/types";
import { invoicesExportHref } from "@/shared/lib/exports";

export async function generateMetadata() {
  const t = await getTranslations("Invoices");
  return { title: t("title") };
}

const CATALOG_SIZE = 500;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    type?: string;
    q?: string;
    overdue?: string;
  }>;
}) {
  const t = await getTranslations("Invoices");
  const tc = await getTranslations("Common");
  const sp = await searchParams;
  const status =
    sp.status && sp.status !== "all" ? (sp.status as InvoiceStatus) : undefined;
  const documentType =
    sp.type && sp.type !== "all"
      ? (sp.type as InvoiceDocumentType)
      : undefined;
  const search = sp.q?.trim() || "";
  const overdueOnly = sp.overdue === "1";

  const data = await listInvoices({
    page: 1,
    pageSize: CATALOG_SIZE,
    status,
    documentType,
    overdueOnly,
  });

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={<InvoiceLifecycleHint overdueOnly={overdueOnly} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <CsvPreview
              href={invoicesExportHref({ status })}
              title={t("csvTitle")}
              description={
                status
                  ? t("csvFiltered", { status })
                  : t("csvAll")
              }
            />
            <Button asChild variant="ghost" size="sm">
              <a href={invoicesExportHref({ status })} download>
                <Download className="size-3.5" aria-hidden />
                {tc("download")}
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/invoices/new?type=Proforma">{t("proforma")}</Link>
            </Button>
            <Button asChild>
              <Link href="/invoices/new">{t("new")}</Link>
            </Button>
          </div>
        }
      />

      <InvoiceFilters
        status={status}
        documentType={documentType}
        overdueOnly={overdueOnly}
      />

      <InvoicesFuzzyTable
        items={data.items}
        initialQuery={search}
        status={status}
        documentType={documentType}
        overdueOnly={overdueOnly}
        truncated={data.totalCount > data.items.length}
      />
    </div>
  );
}
