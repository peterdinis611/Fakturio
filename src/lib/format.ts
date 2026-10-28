import { format, parseISO } from "date-fns";
import { enUS, sk } from "date-fns/locale";
import type { InvoiceStatus } from "@/lib/api/types";

type FormatLocale = "sk" | "en";

function dateFnsLocale(locale: FormatLocale = "sk") {
  return locale === "en" ? enUS : sk;
}

function intlLocale(locale: FormatLocale = "sk") {
  return locale === "en" ? "en-US" : "sk-SK";
}

export function formatMoney(
  amount: number,
  currency = "EUR",
  locale: FormatLocale = "sk",
) {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  value: string | null | undefined,
  locale: FormatLocale = "sk",
) {
  if (!value) return "—";
  try {
    const date = value.includes("T")
      ? parseISO(value)
      : parseISO(`${value}T00:00:00`);
    return format(date, locale === "en" ? "MMM d, yyyy" : "d. M. yyyy", {
      locale: dateFnsLocale(locale),
    });
  } catch {
    return value;
  }
}

export function formatDateTime(
  value: string | null | undefined,
  locale: FormatLocale = "sk",
) {
  if (!value) return "—";
  try {
    return format(
      parseISO(value),
      locale === "en" ? "MMM d, yyyy HH:mm" : "d. M. yyyy HH:mm",
      { locale: dateFnsLocale(locale) },
    );
  } catch {
    return value;
  }
}

export function formatPercent(value: number, locale: FormatLocale = "sk") {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

const statusLabelSk: Record<InvoiceStatus, string> = {
  Draft: "Koncept",
  Issued: "Vystavená",
  Paid: "Zaplatená",
  Cancelled: "Zrušená",
  Overdue: "Po splatnosti",
};

const statusLabelEn: Record<InvoiceStatus, string> = {
  Draft: "Draft",
  Issued: "Issued",
  Paid: "Paid",
  Cancelled: "Cancelled",
  Overdue: "Overdue",
};

export const statusLabel = statusLabelSk;

export function statusLabelFor(
  status: InvoiceStatus,
  locale: FormatLocale = "sk",
) {
  return locale === "en" ? statusLabelEn[status] : statusLabelSk[status];
}

export function emptyDash(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}
