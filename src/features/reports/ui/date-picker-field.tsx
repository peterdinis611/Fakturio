"use client";

import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Label } from "@/shared/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import {
  dateFnsLocale,
  datePattern,
  dayPickerLocale,
} from "@/i18n/locales";

function parseDate(value?: string) {
  if (!value) return undefined;
  try {
    return parseISO(value);
  } catch {
    return undefined;
  }
}

function toIsoDay(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function DatePickerField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  value?: string;
  onChange: (next?: string) => void;
  placeholder?: string;
}) {
  const t = useTranslations("Reports");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const dfsLocale = dateFnsLocale(locale);
  const rdpLocale = dayPickerLocale(locale);

  return (
    <div className="grid gap-1">
      <Label htmlFor={id}>{label}</Label>
      {value ? <input type="hidden" name={name} value={value} /> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-[10.5rem] justify-start gap-2 px-2.5 font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-3.5 opacity-70" aria-hidden />
            {selected
              ? format(selected, datePattern(locale), { locale: dfsLocale })
              : (placeholder ?? t("pickDate"))}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={rdpLocale}
            selected={selected}
            onSelect={(date) => {
              onChange(date ? toIsoDay(date) : undefined);
              setOpen(false);
            }}
            defaultMonth={selected}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
