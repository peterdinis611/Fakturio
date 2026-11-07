import type {
  DocumentFlow,
  InvoiceDocumentType,
  InvoiceStatus,
} from "@/shared/api/types";

/** Pure helper — safe to call from Server Components. */
export function newDocumentHref(
  flow: DocumentFlow,
  type?: InvoiceDocumentType,
  status?: InvoiceStatus,
): { href: string; labelKey: string } | null {
  const base = flow === "Received" ? "/expenses/new" : "/invoices/new";
  if (type === "CreditNote") return null;

  const params = new URLSearchParams();
  if (type && type !== "Invoice") params.set("type", type);
  if (flow === "Received") params.set("flow", "Received");
  const qs = params.toString();
  const href = qs ? `${base}?${qs}` : base;

  if (status === "Draft" && !type) {
    return { href, labelKey: flow === "Received" ? "newExpense" : "newInvoice" };
  }

  switch (type) {
    case "Proforma":
      return {
        href,
        labelKey: flow === "Received" ? "newExpenseProforma" : "newProforma",
      };
    case "Quote":
      return { href, labelKey: "newQuote" };
    case "DeliveryNote":
      return { href, labelKey: "newDeliveryNote" };
    case "SalesOrder":
      return { href, labelKey: "newSalesOrder" };
    default:
      return {
        href,
        labelKey: flow === "Received" ? "newExpense" : "newInvoice",
      };
  }
}
