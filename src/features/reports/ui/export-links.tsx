"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { CsvPreview } from "@/widgets/preview/csv-preview";
import { Button } from "@/shared/ui/button";
import { invoicesExportHref, vatExportHref } from "@/shared/lib/exports";

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CsvPreview
        href={invoicesHref}
        downloadHref={invoicesHref}
        title={t("csvPreview")}
        description="Tabuľkový náhľad exportu pred stiahnutím."
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
        description="Riadky DPH podľa sadzieb a faktúr."
        triggerLabel={t("vatByRate")}
      />
      <Button asChild variant="ghost" size="sm">
        <a href={vatHref} download>
          <Download className="size-3.5" aria-hidden />
          CSV
        </a>
      </Button>
    </div>
  );
}
