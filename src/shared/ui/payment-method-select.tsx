"use client";

import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const METHODS = [
  {
    value: "bank_transfer",
    label: "Bankový prevod",
    hint: "Na účet",
    Icon: LandmarkIcon,
  },
  {
    value: "cash",
    label: "Hotovosť",
    hint: "Pri prevzatí",
    Icon: BanknoteIcon,
  },
  {
    value: "card",
    label: "Karta",
    hint: "Platobný terminál",
    Icon: CreditCardIcon,
  },
  {
    value: "other",
    label: "Iné",
    hint: "Vlastný spôsob",
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
  placeholder = "Vyber…",
  className,
}: Props) {
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
          "[&_[data-payment-meta]]:hidden [&_[data-payment-icon]]:size-6",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
        {METHODS.map(({ value: v, label, hint, Icon }) => (
          <SelectItem key={v} value={v} className="py-2 pl-2 pr-8">
            <span className="inline-flex w-full items-center gap-2.5">
              <span
                data-payment-icon
                className="flex size-7 shrink-0 items-center justify-center rounded-[3px] bg-raised/80 text-ink"
                aria-hidden
              >
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-ink">
                  {label}
                </span>
                <span
                  data-payment-meta
                  className="block truncate text-[11px] text-muted-foreground"
                >
                  {hint}
                </span>
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
