"use client";

import { BookOpen } from "lucide-react";
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <BookOpen className="size-3.5" aria-hidden />
          Katalóg
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <DropdownMenuLabel>Katalóg služieb</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <DropdownMenuItem disabled>Katalóg je prázdny</DropdownMenuItem>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => onPick(item)}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="font-medium">{item.description}</span>
              <span className="data-num text-[11px] text-muted-foreground">
                {formatMoney(item.unitPrice, currency)} / {item.unit}
                {isVatPayer ? ` · DPH ${item.vatRate}%` : ""}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
