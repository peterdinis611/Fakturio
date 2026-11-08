"use client";

import { Download, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { CsvPreview } from "@/widgets/preview/csv-preview";
import { XmlPreview } from "@/widgets/preview/xml-preview";
import { Button } from "@/shared/ui/button";
import {
  accountantPackHref,
  invoicesExportHref,
  moneyS3ExportHref,
  vatExportHref,
} from "@/shared/lib/exports";

export function ReportExportLinks({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) {
  const t = useTranslations("Reports");
  const range = { from, to };
  const invoicesHref = invoicesExportHref(range);
  const vatHref = vatExportHref(range);
  const moneyHref = moneyS3ExportHref(range);
  const packHref = accountantPackHref(range);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm">
          <a href={packHref} download>
            <Package className="size-3.5" aria-hidden />
            {t("accountantPack")}
          </a>
        </Button>
        <XmlPreview
          href={moneyHref}
          title={t("xmlPreviewTitle")}
          description={t("moneyXmlHint")}
          fileName="money-s3.xml"
          triggerLabel={t("moneyXml")}
          triggerVariant="secondary"
        />
        <Button asChild variant="ghost" size="sm">
          <a href={moneyHref} download>
            <Download className="size-3.5" aria-hidden />
            XML
          </a>
        </Button>
        <p className="w-full text-[12px] text-muted-foreground sm:ml-1 sm:w-auto">
          {t("accountantPackHint")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CsvPreview
          href={invoicesHref}
          downloadHref={invoicesHref}
          title={t("csvPreview")}
          description={t("invoicesCsvHint")}
          triggerLabel={t("invoices")}
        />
        <Button asChild variant="ghost" size="sm">
          <a href={invoicesHref} download>
            <Download className="size-3.5" aria-hidden />
            CSV
          </a>
        </Button>
        <span className="mx-0.5 hidden h-4 w-px bg-rule sm:inline" aria-hidden />
        <CsvPreview
          href={vatHref}
          downloadHref={vatHref}
          title={t("csvPreview")}
          description={t("vatCsvHint")}
          triggerLabel={t("vatByRate")}
        />
        <Button asChild variant="ghost" size="sm">
          <a href={vatHref} download>
            <Download className="size-3.5" aria-hidden />
            CSV
          </a>
        </Button>
      </div>
    </div>
  );
}
