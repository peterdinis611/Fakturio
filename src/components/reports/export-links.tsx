import { Download } from "lucide-react";
import { CsvPreview } from "@/components/preview/csv-preview";
import { Button } from "@/components/ui/button";
import { invoicesExportHref, vatExportHref } from "@/lib/exports";

export function ReportExportLinks({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) {
  const range = { from, to };
  const invoicesHref = invoicesExportHref(range);
  const vatHref = vatExportHref(range);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CsvPreview
        href={invoicesHref}
        downloadHref={invoicesHref}
        title="Náhľad — faktúry CSV"
        description="Tabuľkový náhľad exportu pred stiahnutím."
        triggerLabel="Faktúry"
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
        title="Náhľad — DPH CSV"
        description="Riadky DPH podľa sadzieb a faktúr."
        triggerLabel="DPH"
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
