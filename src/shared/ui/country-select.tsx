"use client";

import { countriesForSelect, countryFlag } from "@/shared/lib/countries";
import { cn } from "@/shared/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

const OPTIONS = countriesForSelect();

type Props = {
  id?: string;
  value?: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function CountrySelect({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Vyber krajinu…",
  className,
}: Props) {
  const code = (value || "SK").toUpperCase();

  return (
    <Select value={code} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn(
          "h-9 w-full rounded-[4px] border-border bg-ground",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.code} value={opt.code}>
            <span className="inline-flex items-center gap-2">
              <span className="text-[15px] leading-none" aria-hidden>
                {countryFlag(opt.code)}
              </span>
              <span className="data-num w-7 text-[11px] text-muted-foreground">
                {opt.code}
              </span>
              <span>{opt.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
