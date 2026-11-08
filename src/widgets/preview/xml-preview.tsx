"use client";

import { Check, Code2, Copy, Download } from "lucide-react";
import {
  useEffect,
  useState,
  useTransition,
  type ComponentProps,
} from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/utils";

function highlightXml(xml: string) {
  return xml
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /(&lt;\/?)([\w:.-]+)([^&]*?)(\/?&gt;)/g,
      (_m, open, tag, attrs, close) => {
        const coloredAttrs = String(attrs).replace(
          /([\w:-]+)=(&quot;[^&]*&quot;)/g,
          '<span class="text-chart">$1</span>=<span class="text-positive">$2</span>',
        );
        return `<span class="text-faint">${open}</span><span class="text-ink font-medium">${tag}</span>${coloredAttrs}<span class="text-faint">${close}</span>`;
      },
    );
}

type BaseProps = {
  title: string;
  description?: string;
  fileName?: string;
  triggerLabel?: string;
  triggerVariant?: ComponentProps<typeof Button>["variant"];
  triggerSize?: ComponentProps<typeof Button>["size"];
  className?: string;
};

type Props =
  | (BaseProps & { xml: string; href?: never; downloadHref?: never })
  | (BaseProps & { href: string; xml?: never; downloadHref?: string });

export function XmlPreview({
  title,
  description,
  xml: xmlProp,
  href,
  downloadHref,
  fileName = "export.xml",
  triggerLabel,
  triggerVariant = "outline",
  triggerSize = "sm",
  className,
}: Props) {
  const t = useTranslations("XmlViewer");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const xml = xmlProp ?? fetched ?? "";

  useEffect(() => {
    if (!open || !href) return;

    let cancelled = false;
    startTransition(async () => {
      setError(null);
      setFetched(null);
      try {
        const res = await fetch(href, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (cancelled) return;
        setFetched(text);
      } catch {
        if (!cancelled) setError(t("loadError"));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, href, t]);

  async function copy() {
    if (!xml) return;
    await navigator.clipboard.writeText(xml);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadLocal() {
    if (!xml) return;
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  const remoteDownload = downloadHref ?? href;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          className={className}
        >
          <Code2 className="size-3.5" aria-hidden />
          {triggerLabel ?? t("open")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[min(88vh,720px)] w-[min(96vw,52rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
        showCloseButton
      >
        <DialogHeader className="gap-1 border-b border-rule px-5 py-4">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[4px] border border-border bg-raised/50 text-ink"
              aria-hidden
            >
              <Code2 className="size-3.5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-[16px]">{title}</DialogTitle>
              {description ? (
                <DialogDescription className="mt-1">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b border-rule px-5 py-2.5">
          <span className="font-mono text-[11px] tracking-wide text-faint uppercase">
            application/xml
          </span>
          <span className="ml-auto flex gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!xml || pending}
              onClick={copy}
            >
              {copied ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <Copy className="size-3.5" aria-hidden />
              )}
              {copied ? t("copied") : t("copy")}
            </Button>
            {remoteDownload ? (
              <Button asChild size="sm" variant="outline">
                <a href={remoteDownload} download>
                  <Download className="size-3.5" aria-hidden />
                  {t("download")}
                </a>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!xml}
                onClick={downloadLocal}
              >
                <Download className="size-3.5" aria-hidden />
                {t("download")}
              </Button>
            )}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {pending && !xml && !error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Spinner size="lg" label={t("loading")} />
              <p className="text-[13px] text-muted-foreground">{t("loading")}</p>
            </div>
          ) : null}

          {error ? (
            <p className="px-5 py-10 text-center text-[14px] text-negative">
              {error}
            </p>
          ) : null}

          {!error && xml ? (
            <pre
              className={cn(
                "min-h-0 overflow-auto bg-soft/40 px-5 py-4 font-mono text-[12px] leading-5 text-ink",
              )}
            >
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightXml(xml.slice(0, 200_000)),
                }}
              />
              {xml.length > 200_000 ? (
                <span className="mt-2 block text-faint">…</span>
              ) : null}
            </pre>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
