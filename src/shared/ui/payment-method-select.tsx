"use client";

import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  MoreHorizontalIcon,
  type LucideIcon,
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

const METHODS: ReadonlyArray<{
  value: string;
  labelKey: "payBankTransfer" | "payCash" | "payCard" | "payOther";
  hintKey:
    | "payBankTransferHint"
    | "payCashHint"
    | "payCardHint"
    | "payOtherHint";
  Icon: LucideIcon;
}> = [
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
];

type Props = {
  id?: string;
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

function MethodRow({
  label,
  hint,
  Icon,
}: {
  label: string;
  hint: string;
  Icon: LucideIcon;
}) {
  return (
    <span className="inline-flex w-full min-w-0 items-center gap-2.5">
      <span
        data-pay-icon
        className="flex size-7 shrink-0 items-center justify-center rounded-[3px] bg-raised/80 text-muted-foreground"
        aria-hidden
      >
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[13px] font-medium text-ink">{label}</span>
        <span
          data-pay-hint
          className="block truncate text-[11px] text-muted-foreground"
        >
          {hint}
        </span>
      </span>
    </span>
  );
}

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
      <SelectTrigger
        id={id}
        className={cn(
          "h-9 w-full rounded-[4px] border-border bg-ground",
          // Trigger: single line — hide hint, tighten icon chip
          "[&_[data-pay-hint]]:hidden [&_[data-pay-icon]]:size-6",
          className,
        )}
      >
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        className="min-w-[var(--radix-select-trigger-width)]"
      >
        {METHODS.map(({ value: method, labelKey, hintKey, Icon }) => (
          <SelectItem
            key={method}
            value={method}
            className="py-2 pl-2 pr-8"
          >
            <MethodRow
              label={t(labelKey)}
              hint={t(hintKey)}
              Icon={Icon}
            />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
