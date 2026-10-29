"use client";

import { BookmarkPlus, LayoutTemplate } from "lucide-react";
import { useEffect, useState } from "react";
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
    toast.success("Šablóna riadku uložená");
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
            Šablóny
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel>Rýchle položky</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {templates.length === 0 ? (
            <DropdownMenuItem disabled>Žiadne šablóny</DropdownMenuItem>
          ) : (
            templates.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onSelect={() => onApply(t)}
                className="flex flex-col items-start gap-0.5"
              >
                <span className="text-[13px] font-medium">{t.description}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {t.unit} · {formatMoney(t.unitPrice, currency)} · {t.vatRate}%
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
