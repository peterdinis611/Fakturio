import { format, parseISO } from "date-fns";
import type { AuditAction, InvoiceDocumentType, InvoiceStatus } from "@/shared/api/types";
import {
  dateFnsLocale,
  datePattern,
  intlLocale,
  resolveAppLocale,
  type AppLocale,
} from "@/i18n/locales";

export type FormatLocale = AppLocale;

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
    return format(date, datePattern(locale), {
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
    return format(parseISO(value), datePattern(locale, true), {
      locale: dateFnsLocale(locale),
    });
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

const statusLabels: Record<AppLocale, Record<InvoiceStatus, string>> = {
  sk: {
    Draft: "Koncept",
    Issued: "Vystavená",
    Paid: "Zaplatená",
    Cancelled: "Zrušená",
    Overdue: "Po splatnosti",
  },
  en: {
    Draft: "Draft",
    Issued: "Issued",
    Paid: "Paid",
    Cancelled: "Cancelled",
    Overdue: "Overdue",
  },
  cs: {
    Draft: "Koncept",
    Issued: "Vystavená",
    Paid: "Zaplacená",
    Cancelled: "Zrušená",
    Overdue: "Po splatnosti",
  },
  de: {
    Draft: "Entwurf",
    Issued: "Ausgestellt",
    Paid: "Bezahlt",
    Cancelled: "Storniert",
    Overdue: "Überfällig",
  },
};

export const statusLabel = statusLabels.sk;

export function statusLabelFor(
  status: InvoiceStatus,
  locale: FormatLocale = "sk",
) {
  return statusLabels[resolveAppLocale(locale)][status];
}

export function emptyDash(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

const paymentMethodLabels: Record<AppLocale, Record<string, string>> = {
  sk: {
    bank_transfer: "Bankový prevod",
    cash: "Hotovosť",
    card: "Karta",
    other: "Iné",
  },
  en: {
    bank_transfer: "Bank transfer",
    cash: "Cash",
    card: "Card",
    other: "Other",
  },
  cs: {
    bank_transfer: "Bankovní převod",
    cash: "Hotovost",
    card: "Karta",
    other: "Jiné",
  },
  de: {
    bank_transfer: "Überweisung",
    cash: "Bar",
    card: "Karte",
    other: "Sonstiges",
  },
};

export function paymentMethodLabel(
  method: string | null | undefined,
  locale: FormatLocale = "sk",
) {
  if (!method) return "—";
  const map = paymentMethodLabels[resolveAppLocale(locale)];
  return map[method] ?? method;
}

/** Group IBAN into 4-char blocks for display. */
export function formatIban(iban: string | null | undefined) {
  if (!iban) return "—";
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  if (!clean) return "—";
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

const documentTypeLabels: Record<
  AppLocale,
  Record<InvoiceDocumentType, string>
> = {
  sk: {
    Invoice: "Faktúra",
    Proforma: "Zálohová",
    CreditNote: "Dobropis",
    Quote: "Cenová ponuka",
    DeliveryNote: "Dodací list",
    SalesOrder: "Objednávka",
  },
  en: {
    Invoice: "Invoice",
    Proforma: "Proforma",
    CreditNote: "Credit note",
    Quote: "Quote",
    DeliveryNote: "Delivery note",
    SalesOrder: "Sales order",
  },
  cs: {
    Invoice: "Faktura",
    Proforma: "Zálohová",
    CreditNote: "Dobropis",
    Quote: "Cenová nabídka",
    DeliveryNote: "Dodací list",
    SalesOrder: "Objednávka",
  },
  de: {
    Invoice: "Rechnung",
    Proforma: "Proforma",
    CreditNote: "Gutschrift",
    Quote: "Angebot",
    DeliveryNote: "Lieferschein",
    SalesOrder: "Auftrag",
  },
};

export function documentTypeLabel(
  type: InvoiceDocumentType | null | undefined,
  locale: FormatLocale = "sk",
) {
  const map = documentTypeLabels[resolveAppLocale(locale)];
  if (!type) return map.Invoice;
  return map[type];
}

const auditActionLabels: Record<AppLocale, Record<AuditAction, string>> = {
  sk: {
    Created: "Vytvorenie",
    Updated: "Úprava",
    Issued: "Vystavenie",
    Paid: "Úhrada",
    Cancelled: "Zrušenie",
    ReminderSent: "Upomienka",
    Deleted: "Zmazanie",
    Duplicated: "Duplikácia",
    OverdueMarked: "Po splatnosti",
    CreditNoteCreated: "Dobropis",
    ProformaFinalized: "Záloha → faktúra",
    CustomerCreated: "Odberateľ vytvorený",
    CustomerUpdated: "Odberateľ upravený",
    CustomerDeleted: "Odberateľ zmazaný",
    CompanyUpdated: "Firma upravená",
    PaymentImportApplied: "Import platieb",
    ExportRequested: "Export",
    GdprExport: "GDPR export",
    GdprErasure: "GDPR výmaz",
    RecurringCreated: "Opakovaná vytvorená",
    RecurringUpdated: "Opakovaná upravená",
    RecurringDeleted: "Opakovaná zmazaná",
    RecurringGenerated: "Opakovaná generovaná",
    LoginSucceeded: "Prihlásenie",
  },
  en: {
    Created: "Created",
    Updated: "Updated",
    Issued: "Issued",
    Paid: "Paid",
    Cancelled: "Cancelled",
    ReminderSent: "Reminder",
    Deleted: "Deleted",
    Duplicated: "Duplicated",
    OverdueMarked: "Marked overdue",
    CreditNoteCreated: "Credit note",
    ProformaFinalized: "Proforma → invoice",
    CustomerCreated: "Customer created",
    CustomerUpdated: "Customer updated",
    CustomerDeleted: "Customer deleted",
    CompanyUpdated: "Company updated",
    PaymentImportApplied: "Payment import",
    ExportRequested: "Export",
    GdprExport: "GDPR export",
    GdprErasure: "GDPR erasure",
    RecurringCreated: "Recurring created",
    RecurringUpdated: "Recurring updated",
    RecurringDeleted: "Recurring deleted",
    RecurringGenerated: "Recurring generated",
    LoginSucceeded: "Login",
  },
  cs: {
    Created: "Vytvoření",
    Updated: "Úprava",
    Issued: "Vystavení",
    Paid: "Úhrada",
    Cancelled: "Zrušení",
    ReminderSent: "Upomínka",
    Deleted: "Smazání",
    Duplicated: "Duplikace",
    OverdueMarked: "Po splatnosti",
    CreditNoteCreated: "Dobropis",
    ProformaFinalized: "Záloha → faktura",
    CustomerCreated: "Odběratel vytvořen",
    CustomerUpdated: "Odběratel upraven",
    CustomerDeleted: "Odběratel smazán",
    CompanyUpdated: "Firma upravena",
    PaymentImportApplied: "Import plateb",
    ExportRequested: "Export",
    GdprExport: "GDPR export",
    GdprErasure: "GDPR výmaz",
    RecurringCreated: "Opakovaná vytvořena",
    RecurringUpdated: "Opakovaná upravena",
    RecurringDeleted: "Opakovaná smazána",
    RecurringGenerated: "Opakovaná generována",
    LoginSucceeded: "Přihlášení",
  },
  de: {
    Created: "Erstellt",
    Updated: "Aktualisiert",
    Issued: "Ausgestellt",
    Paid: "Bezahlt",
    Cancelled: "Storniert",
    ReminderSent: "Erinnerung",
    Deleted: "Gelöscht",
    Duplicated: "Dupliziert",
    OverdueMarked: "Als überfällig markiert",
    CreditNoteCreated: "Gutschrift",
    ProformaFinalized: "Proforma → Rechnung",
    CustomerCreated: "Kunde erstellt",
    CustomerUpdated: "Kunde aktualisiert",
    CustomerDeleted: "Kunde gelöscht",
    CompanyUpdated: "Firma aktualisiert",
    PaymentImportApplied: "Zahlungsimport",
    ExportRequested: "Export",
    GdprExport: "DSGVO-Export",
    GdprErasure: "DSGVO-Löschung",
    RecurringCreated: "Wiederkehrend erstellt",
    RecurringUpdated: "Wiederkehrend aktualisiert",
    RecurringDeleted: "Wiederkehrend gelöscht",
    RecurringGenerated: "Wiederkehrend generiert",
    LoginSucceeded: "Anmeldung",
  },
};

export function auditActionLabel(
  action: AuditAction,
  locale: FormatLocale = "sk",
) {
  const map = auditActionLabels[resolveAppLocale(locale)];
  return map[action] ?? action;
}
