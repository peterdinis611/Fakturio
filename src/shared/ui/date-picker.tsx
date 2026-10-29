"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { sk as skDateFns } from "date-fns/locale";
import { sk as skDayPicker } from "react-day-picker/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";

type DatePickerProps = {
  id?: string;
  value?: string | null;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Optional lower bound (inclusive), ISO yyyy-MM-dd */
  fromDate?: string | null;
  /** Optional upper bound (inclusive), ISO yyyy-MM-dd */
  toDate?: string | null;
};

function parseIsoDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  try {
    const date = value.includes("T")
      ? parseISO(value)
      : parseISO(`${value}T00:00:00`);
    return isValid(date) ? date : undefined;
  } catch {
    return undefined;
  }
}

function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function DatePicker({
  id,
  value,
  onChange,
  disabled,
  placeholder = "Vyber dátum",
  className,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);
  const from = parseIsoDate(fromDate);
  const to = parseIsoDate(toDate);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!selected}
          className={cn(
            "h-9 w-full justify-between rounded-[4px] border-border bg-surface px-3 font-normal hover:bg-surface",
            "data-[empty=true]:text-faint",
            className,
          )}
        >
          <span className="truncate">
            {selected
              ? format(selected, "d. M. yyyy", { locale: skDateFns })
              : placeholder}
          </span>
          <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={skDayPicker}
          captionLayout="dropdown"
          selected={selected}
          defaultMonth={selected}
          disabled={[
            ...(from ? [{ before: from }] : []),
            ...(to ? [{ after: to }] : []),
          ]}
          onSelect={(date) => {
            onChange?.(date ? toIsoDate(date) : "");
            setOpen(false);
          }}
        />
        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || !value}
            onClick={() => {
              onChange?.("");
              setOpen(false);
            }}
          >
            Vymazať
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => {
              onChange?.(toIsoDate(new Date()));
              setOpen(false);
            }}
          >
            Dnes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
