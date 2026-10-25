"use client";

import { format, parseISO } from "date-fns";
import { sk as skDateFns } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { sk } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  placeholder = "Vybrať dátum",
}: {
  id: string;
  name: string;
  label: string;
  value?: string;
  onChange: (next?: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);

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
              ? format(selected, "d. M. yyyy", { locale: skDateFns })
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={sk}
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
