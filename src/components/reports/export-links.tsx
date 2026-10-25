import { Download } from "lucide-react";
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={invoicesExportHref(range)} download>
          <Download className="size-3.5" aria-hidden />
          Faktúry CSV
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={vatExportHref(range)} download>
          <Download className="size-3.5" aria-hidden />
          DPH CSV
        </a>
      </Button>
    </div>
  );
}
