"use client";

import { Download, Eye, Table2 } from "lucide-react";
import {
  useEffect,
  useState,
  useTransition,
  type ComponentProps,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { parseCsv, type CsvTable } from "@/lib/preview/parse-csv";
import { cn } from "@/lib/utils";

const PREVIEW_ROWS = 80;

export function CsvPreview({
  href,
  title,
  description,
  downloadHref,
  triggerLabel = "Náhľad CSV",
  triggerVariant = "outline",
  triggerSize = "sm",
}: {
  /** URL that returns CSV text (e.g. `/api/exports/invoices`). */
  href: string;
  title: string;
  description?: string;
  /** Optional separate download URL; defaults to `href`. */
  downloadHref?: string;
  triggerLabel?: string;
  triggerVariant?: ComponentProps<typeof Button>["variant"];
  triggerSize?: ComponentProps<typeof Button>["size"];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [table, setTable] = useState<CsvTable | null>(null);
  const [mode, setMode] = useState<"table" | "raw">("table");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    startTransition(async () => {
      setError(null);
      setRaw(null);
      setTable(null);
      try {
        const res = await fetch(href, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (cancelled) return;
        setRaw(text);
        setTable(parseCsv(text, PREVIEW_ROWS));
      } catch {
        if (!cancelled) setError("CSV sa nepodarilo načítať.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, href]);

  const truncated =
    table != null &&
    raw != null &&
    raw.split(/\r?\n/).filter((l) => l.length > 0).length - 1 > PREVIEW_ROWS;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={triggerVariant} size={triggerSize}>
          <Eye className="size-3.5" aria-hidden />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[min(88vh,720px)] w-[min(96vw,56rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
        showCloseButton
      >
        <DialogHeader className="gap-1 border-b border-rule px-5 py-4">
          <DialogTitle className="text-[16px]">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b border-rule px-5 py-2.5">
          <div className="flex rounded-[4px] border border-border p-0.5">
            <button
              type="button"
              onClick={() => setMode("table")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1 text-[12px] font-medium",
                mode === "table"
                  ? "bg-ink text-primary-foreground"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              <Table2 className="size-3" aria-hidden />
              Tabuľka
            </button>
            <button
              type="button"
              onClick={() => setMode("raw")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1 text-[12px] font-medium",
                mode === "raw"
                  ? "bg-ink text-primary-foreground"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              Raw
            </button>
          </div>
          {table ? (
            <span className="font-mono text-[11px] text-faint tabular-nums">
              {table.headers.length} stĺpcov · {table.rows.length}
              {truncated ? "+" : ""} riadkov
            </span>
          ) : null}
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <a href={downloadHref ?? href} download>
              <Download className="size-3.5" aria-hidden />
              Stiahnuť
            </a>
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {pending && !table && !error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Spinner size="lg" label="Načítavam CSV" />
              <p className="text-[13px] text-muted-foreground">
                Načítavam export…
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="px-5 py-10 text-center text-[14px] text-negative">
              {error}
            </p>
          ) : null}

          {!pending && !error && mode === "table" && table ? (
            table.headers.length === 0 ? (
              <p className="px-5 py-10 text-center text-[14px] text-muted-foreground">
                Súbor je prázdny.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max border-collapse text-left text-[12px]">
                  <thead className="sticky top-0 z-10 bg-surface">
                    <tr className="border-b border-rule">
                      {table.headers.map((h, i) => (
                        <th
                          key={`${h}-${i}`}
                          className="whitespace-nowrap px-3 py-2.5 font-medium text-muted-foreground"
                        >
                          {h || `Col ${i + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className="border-b border-rule/80 hover:bg-raised/40"
                      >
                        {table.headers.map((_, ci) => (
                          <td
                            key={ci}
                            className="max-w-[14rem] truncate px-3 py-2 font-mono text-ink tabular-nums"
                            title={row[ci] ?? ""}
                          >
                            {row[ci] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {truncated ? (
                  <p className="border-t border-rule px-5 py-3 text-[12px] text-faint">
                    Zobrazených prvých {PREVIEW_ROWS} riadkov — stiahni CSV pre
                    celý súbor.
                  </p>
                ) : null}
              </div>
            )
          ) : null}

          {!pending && !error && mode === "raw" && raw != null ? (
            <pre className="overflow-auto bg-soft/40 px-5 py-4 font-mono text-[11px] leading-5 whitespace-pre-wrap text-ink">
              {raw.slice(0, 120_000)}
              {raw.length > 120_000 ? "\n…\n" : ""}
            </pre>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
