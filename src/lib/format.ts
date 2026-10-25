import { format, parseISO } from "date-fns";
import { sk } from "date-fns/locale";
import type { InvoiceStatus } from "@/lib/api/types";

export function formatMoney(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    const date = value.includes("T") ? parseISO(value) : parseISO(`${value}T00:00:00`);
    return format(date, "d. M. yyyy", { locale: sk });
  } catch {
    return value;
  }
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return format(parseISO(value), "d. M. yyyy HH:mm", { locale: sk });
  } catch {
    return value;
  }
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("sk-SK", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export const statusLabel: Record<InvoiceStatus, string> = {
  Draft: "Koncept",
  Issued: "Vystavená",
  Paid: "Zaplatená",
  Cancelled: "Zrušená",
  Overdue: "Po splatnosti",
};

export function emptyDash(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}
