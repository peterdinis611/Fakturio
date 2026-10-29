"use client";

import * as React from "react";
import { countryDial } from "@/shared/lib/countries";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";

type Props = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange"
> & {
  value?: string;
  onChange: (value: string) => void;
  /** ISO country for dial prefix hint. */
  countryCode?: string;
};

function normalizePhone(raw: string) {
  return raw.replace(/[^\d+\s()-]/g, "").replace(/\s{2,}/g, " ").trimStart();
}

export function PhoneInput({
  value = "",
  onChange,
  countryCode = "SK",
  className,
  disabled,
  id,
  placeholder,
  ...props
}: Props) {
  const dial = countryDial(countryCode);
  const international = value.trim().startsWith("+");

  return (
    <div
      className={cn(
        "flex h-9 overflow-hidden rounded-[4px] border border-border bg-ground transition-colors",
        "focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/15",
        disabled && "opacity-60",
        className,
      )}
    >
      {!international ? (
        <span
          aria-hidden
          className="inline-flex shrink-0 items-center border-r border-border bg-raised/40 px-2.5 data-num text-[12px] text-muted-foreground"
          title={`Predvoľba ${dial}`}
        >
          {dial}
        </span>
      ) : null}
      <Input
        {...props}
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        disabled={disabled}
        value={value}
        placeholder={placeholder ?? (international ? "+421 901 234 567" : "901 234 567")}
        onChange={(e) => onChange(normalizePhone(e.target.value))}
        className="h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
