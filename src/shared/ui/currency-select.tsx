"use client";

import {
  CURRENCIES,
  currencyFlag,
  getCurrency,
} from "@/shared/lib/currencies";
import { cn } from "@/shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type Props = {
  id?: string;
  value?: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

function CurrencyRow({ code }: { code: string }) {
  const opt = getCurrency(code);
  if (!opt) {
    return <span className="data-num">{code}</span>;
  }

  return (
    <span className="inline-flex w-full min-w-0 items-center gap-2.5">
      <span
        data-currency-flag
        className="flex size-7 shrink-0 items-center justify-center rounded-[3px] bg-raised/80 text-[15px] leading-none"
        aria-hidden
      >
        {currencyFlag(opt.code)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="data-num block text-[13px] font-medium tracking-wide text-ink">
          {opt.code}
        </span>
        <span
          data-currency-meta
          className="block truncate text-[11px] text-muted-foreground"
        >
          {opt.name}
        </span>
      </span>
      <span className="data-num shrink-0 text-[14px] font-medium text-ink/80">
        {opt.symbol}
      </span>
    </span>
  );
}

export function CurrencySelect({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Vyber menu…",
  className,
}: Props) {
  const code = (value || "EUR").toUpperCase();

  return (
    <Select value={code} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn(
          "h-9 w-full rounded-[4px] border-border bg-ground",
          "[&_[data-currency-meta]]:hidden [&_[data-currency-flag]]:size-6 [&_[data-currency-flag]]:text-[14px]",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="min-w-[var(--radix-select-trigger-width)]">
        {CURRENCIES.map((opt) => (
          <SelectItem
            key={opt.code}
            value={opt.code}
            className="py-2 pl-2 pr-8"
          >
            <CurrencyRow code={opt.code} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
