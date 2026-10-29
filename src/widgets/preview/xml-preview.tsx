"use client";

import { Check, Code2, Copy, Download } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
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

export function XmlPreview({
  title,
  description,
  xml,
  fileName,
  triggerLabel = "Náhľad XML",
  triggerVariant = "ghost",
  triggerSize = "sm",
  className,
}: {
  title: string;
  description?: string;
  xml: string;
  fileName: string;
  triggerLabel?: string;
  triggerVariant?: ComponentProps<typeof Button>["variant"];
  triggerSize?: ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(xml);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function download() {
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size={triggerSize}
          className={className}
        >
          <Code2 className="size-3.5" aria-hidden />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[min(88vh,720px)] w-[min(96vw,52rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
        showCloseButton
      >
        <DialogHeader className="gap-1 border-b border-rule px-5 py-4">
          <DialogTitle className="text-[16px]">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b border-rule px-5 py-2.5">
          <span className="font-mono text-[11px] tracking-wide text-faint uppercase">
            application/xml
          </span>
          <span className="ml-auto flex gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={copy}>
              {copied ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <Copy className="size-3.5" aria-hidden />
              )}
              {copied ? "Skopírované" : "Kopírovať"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={download}>
              <Download className="size-3.5" aria-hidden />
              Stiahnuť
            </Button>
          </span>
        </div>

        <pre
          className={cn(
            "min-h-0 flex-1 overflow-auto bg-soft/40 px-5 py-4 font-mono text-[12px] leading-5 text-ink",
          )}
        >
          <code
            dangerouslySetInnerHTML={{ __html: highlightXml(xml) }}
          />
        </pre>
      </DialogContent>
    </Dialog>
  );
}
