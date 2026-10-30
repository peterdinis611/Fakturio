"use client";

import { BookOpen } from "lucide-react";
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
import type { ServiceCatalogItem } from "@/shared/api/types";
import { formatMoney } from "@/shared/lib/format";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  disabled?: boolean;
  currency: string;
  isVatPayer: boolean;
  items: ServiceCatalogItem[];
  onPick: (item: ServiceCatalogItem) => void;
};

export function CatalogPicker({
  disabled,
  currency,
  isVatPayer,
  items,
  onPick,
}: Props) {
  const t = useTranslations("InvoiceDetail");
  const locale = useLocale() as AppLocale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <BookOpen className="size-3.5" aria-hidden />
          {t("catalog")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <DropdownMenuLabel>{t("catalog")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <DropdownMenuItem disabled>{t("catalogEmpty")}</DropdownMenuItem>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => onPick(item)}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="font-medium">{item.description}</span>
              <span className="data-num text-[11px] text-muted-foreground">
                {formatMoney(item.unitPrice, currency, locale)} / {item.unit}
                {isVatPayer ? ` · DPH ${item.vatRate}%` : ""}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
