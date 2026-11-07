"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import type {
  DocumentFlow,
  InvoiceDocumentType,
  InvoiceStatus,
} from "@/shared/api/types";

export type DocumentNavKey =
  | "Invoice"
  | "Proforma"
  | "DeliveryNote"
  | "SalesOrder"
  | "Quote"
  | "Recurring"
  | "CreditNote"
  | "Drafts";

type Props = {
  flow?: DocumentFlow;
  activeType?: InvoiceDocumentType;
  activeStatus?: InvoiceStatus;
};

function tabsFor(flow: DocumentFlow) {
  const base = flow === "Received" ? "/expenses" : "/invoices";
  const q = (type?: InvoiceDocumentType, status?: InvoiceStatus) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const tabs: {
    key: DocumentNavKey;
    href: string;
    type?: InvoiceDocumentType;
    status?: InvoiceStatus;
    issuedOnly?: boolean;
  }[] = [
    { key: "Invoice", href: q(), type: "Invoice" },
    { key: "Proforma", href: q("Proforma"), type: "Proforma" },
    { key: "DeliveryNote", href: q("DeliveryNote"), type: "DeliveryNote" },
    { key: "SalesOrder", href: q("SalesOrder"), type: "SalesOrder" },
    { key: "Quote", href: q("Quote"), type: "Quote" },
  ];

  if (flow === "Issued") {
    tabs.push({ key: "Recurring", href: "/recurring", issuedOnly: true });
  }

  tabs.push(
    { key: "CreditNote", href: q("CreditNote"), type: "CreditNote" },
    { key: "Drafts", href: q(undefined, "Draft"), status: "Draft" },
  );

  return tabs;
}

export function DocumentTypeNav({
  flow = "Issued",
  activeType,
  activeStatus,
}: Props) {
  const t = useTranslations("Documents");
  const pathname = usePathname();
  const onRecurring = pathname.startsWith("/recurring");
  const tabs = tabsFor(flow);

  return (
    <nav
      aria-label={t("navAria")}
      className="document-type-nav -mx-1 overflow-x-auto"
    >
      <ul className="flex min-w-max items-stretch gap-0 rounded-b-[4px] bg-ink px-1">
        {tabs.map((tab) => {
          const active = onRecurring
            ? tab.key === "Recurring"
            : tab.key === "Drafts"
              ? activeStatus === "Draft" && !activeType
              : tab.key === "Invoice"
                ? (!activeType || activeType === "Invoice") &&
                  activeStatus !== "Draft"
                : activeType === tab.type && activeStatus !== "Draft";

          return (
            <li key={tab.key} className="relative">
              <Link
                href={tab.href}
                className={cn(
                  "relative block px-3.5 py-2.5 text-[13px] whitespace-nowrap transition-colors",
                  active
                    ? "font-semibold text-primary-foreground"
                    : "text-primary-foreground/55 hover:text-primary-foreground/90",
                )}
                aria-current={active ? "page" : undefined}
              >
                {flow === "Received" && tab.key === "Invoice"
                  ? t("ReceivedInvoice")
                  : t(tab.key)}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-1/2 size-0 -translate-x-1/2 translate-y-[1px] border-x-[6px] border-b-[6px] border-x-transparent border-b-surface"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

