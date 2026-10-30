"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import {
  countriesForSelect,
  countryDial,
  countryFlag,
  getCountry,
} from "@/shared/lib/countries";
import { useFuzzySearch } from "@/shared/hooks/use-fuzzy-search";
import { fuzzyKeys } from "@/shared/lib/fuzzy-search";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";

const OPTIONS = countriesForSelect();

type Props = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange"
> & {
  value?: string;
  onChange: (value: string) => void;
  /** ISO country for dial / flag. */
  countryCode?: string;
  /** Fired when the user picks a country from the flag menu. */
  onCountryChange?: (code: string) => void;
};

function normalizePhone(raw: string) {
  return raw.replace(/[^\d+\s()-]/g, "").replace(/\s{2,}/g, " ").trimStart();
}

function stripLeadingDial(phone: string, dial: string) {
  const trimmed = phone.trimStart();
  if (!trimmed.startsWith(dial)) return phone;
  return trimmed.slice(dial.length).trimStart();
}

export function PhoneInput({
  value = "",
  onChange,
  countryCode = "SK",
  onCountryChange,
  className,
  disabled,
  id,
  placeholder,
  ...props
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [dialCountry, setDialCountry] = React.useState(
    () => countryCode.toUpperCase(),
  );
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDialCountry(countryCode.toUpperCase());
  }, [countryCode]);

  const code = dialCountry;
  const country = getCountry(code);
  const dial = country?.dial ?? countryDial(code);
  const flag = countryFlag(code);
  const international = value.trim().startsWith("+");

  const filtered = useFuzzySearch(OPTIONS, query, {
    keys: fuzzyKeys.country,
    threshold: 0.32,
  });

  function selectCountry(next: string) {
    const nextCode = next.toUpperCase();
    const nextDial = countryDial(nextCode);
    const prevDial = dial;

    setDialCountry(nextCode);
    onCountryChange?.(nextCode);

    if (international && value.trim().startsWith(prevDial)) {
      const rest = stripLeadingDial(value, prevDial);
      onChange(normalizePhone(rest ? `${nextDial} ${rest}` : nextDial));
    }

    setOpen(false);
    setQuery("");
  }

  return (
    <div
      className={cn(
        "flex h-9 overflow-hidden rounded-[4px] border border-border bg-ground transition-colors",
        "focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/15",
        disabled && "opacity-60",
        className,
      )}
    >
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={`Predvoľba ${country?.name ?? code} ${dial}`}
            className={cn(
              "inline-flex h-full shrink-0 items-center gap-1.5 border-r border-border bg-raised/40 px-2.5",
              "text-ink outline-none transition-colors",
              "hover:bg-raised focus-visible:bg-raised",
              "disabled:pointer-events-none",
            )}
          >
            <span className="text-[16px] leading-none" aria-hidden>
              {flag}
            </span>
            <span className="data-num text-[12px] text-muted-foreground">
              {dial}
            </span>
            <ChevronsUpDownIcon className="size-3 text-faint" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(100vw-2rem,20rem)] overflow-hidden p-0"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchRef.current?.focus();
          }}
        >
          <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
            <SearchIcon className="size-3.5 shrink-0 text-faint" aria-hidden />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hľadaj krajinu alebo predvoľbu…"
              className="h-7 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-faint"
            />
          </div>
          <ul
            role="listbox"
            aria-label="Predvoľba krajiny"
            className="max-h-64 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-[13px] text-muted-foreground">
                Žiadna krajina
              </li>
            ) : (
              filtered.map((opt) => {
                const selected = opt.code === code;
                return (
                  <li key={opt.code} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => selectCountry(opt.code)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors",
                        "hover:bg-raised focus-visible:bg-raised focus-visible:outline-none",
                        selected && "bg-raised/70",
                      )}
                    >
                      <span className="text-[16px] leading-none" aria-hidden>
                        {countryFlag(opt.code)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-ink">
                        {opt.name}
                      </span>
                      <span className="data-num shrink-0 text-[12px] text-muted-foreground">
                        {opt.dial}
                      </span>
                      <CheckIcon
                        className={cn(
                          "size-3.5 shrink-0 text-ink",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden
                      />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>

      <Input
        {...props}
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        disabled={disabled}
        value={value}
        placeholder={
          placeholder ?? (international ? `${dial} 901 234 567` : "901 234 567")
        }
        onChange={(e) => onChange(normalizePhone(e.target.value))}
        className="h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
