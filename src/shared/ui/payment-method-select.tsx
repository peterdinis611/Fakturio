"use client";

import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const METHOD_KEYS = [
  {
    value: "bank_transfer",
    labelKey: "payBankTransfer",
    hintKey: "payBankTransferHint",
    Icon: LandmarkIcon,
  },
  {
    value: "cash",
    labelKey: "payCash",
    hintKey: "payCashHint",
    Icon: BanknoteIcon,
  },
  {
    value: "card",
    labelKey: "payCard",
    hintKey: "payCardHint",
    Icon: CreditCardIcon,
  },
  {
    value: "other",
    labelKey: "payOther",
    hintKey: "payOtherHint",
    Icon: MoreHorizontalIcon,
  },
] as const;

type Props = {
  id?: string;
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function PaymentMethodSelect({
  id,
  value,
  onChange,
  disabled,
  placeholder,
  className,
}: Props) {
  const t = useTranslations("Labels");
  const tc = useTranslations("Common");
  const resolvedPlaceholder = placeholder ?? tc("selectPlaceholder");

  return (
    <Select
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn(className)}>
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {METHOD_KEYS.map(({ value: method, labelKey, hintKey, Icon }) => (
          <SelectItem key={method} value={method}>
            <span className="flex items-center gap-2">
              <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex min-w-0 flex-col">
                <span>{t(labelKey)}</span>
                <span className="text-[11px] text-muted-foreground">
                  {t(hintKey)}
                </span>
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
