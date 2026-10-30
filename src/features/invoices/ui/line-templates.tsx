"use client";

import { BookmarkPlus, LayoutTemplate } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  loadLineTemplates,
  saveLineTemplates,
  upsertLineTemplate,
  type LineTemplate,
} from "@/shared/lib/line-templates";
import { formatMoney } from "@/shared/lib/format";
import { toast } from "@/shared/toast";
import type { AppLocale } from "@/i18n/routing";

export function LineTemplatesMenu({
  disabled,
  currency,
  onApply,
  onSaveFromLine,
}: {
  disabled?: boolean;
  currency: string;
  onApply: (template: LineTemplate) => void;
  onSaveFromLine?: () =>
    | { description: string; unit: string; unitPrice: number; vatRate: number }
    | null;
}) {
  const t = useTranslations("InvoiceDetail");
  const locale = useLocale() as AppLocale;
  const [templates, setTemplates] = useState<LineTemplate[]>([]);

  useEffect(() => {
    setTemplates(loadLineTemplates());
  }, []);

  function persist(next: LineTemplate[]) {
    setTemplates(next);
    saveLineTemplates(next);
  }

  function handleSaveCurrent() {
    const line = onSaveFromLine?.();
    if (!line?.description.trim()) {
      toast.error("Najprv vyplň popis položky, ktorú chceš uložiť.");
      return;
    }
    const next = upsertLineTemplate(templates, line);
    persist(next);
    toast.success(t("templateSaved"));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
          >
            <LayoutTemplate className="size-3.5" aria-hidden />
            {t("templates")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel>{t("templates")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {templates.length === 0 ? (
            <DropdownMenuItem disabled>{t("noTemplates")}</DropdownMenuItem>
          ) : (
            templates.map((tmpl) => (
              <DropdownMenuItem
                key={tmpl.id}
                onSelect={() => onApply(tmpl)}
                className="flex flex-col items-start gap-0.5"
              >
                <span className="text-[13px] font-medium">{tmpl.description}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {tmpl.unit} · {formatMoney(tmpl.unitPrice, currency, locale)} ·{" "}
                  {tmpl.vatRate}%
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {onSaveFromLine ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={handleSaveCurrent}
          title="Uložiť posledný riadok ako šablónu"
        >
          <BookmarkPlus className="size-3.5" aria-hidden />
          Uložiť riadok
        </Button>
      ) : null}
    </div>
  );
}
