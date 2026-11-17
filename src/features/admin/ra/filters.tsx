"use client";

import { SearchInput, SelectInput, TextInput } from "react-admin";

export const INVOICE_STATUS_CHOICES = [
  { id: "Draft", name: "Draft" },
  { id: "Issued", name: "Issued" },
  { id: "Paid", name: "Paid" },
  { id: "Overdue", name: "Overdue" },
  { id: "Cancelled", name: "Cancelled" },
];

/** Free-text search only (users, companies, audit logs). */
export const listFilters = [<SearchInput key="q" source="q" alwaysOn />];

/** Search + tenant (company) scope — customers, notes, catalog, recurring, etc. */
export const companyScopedFilters = [
  <SearchInput key="q" source="q" alwaysOn />,
  <TextInput key="companyId" source="companyId" label="Company ID" />,
];

/** Invoices: search + company + status. */
export const invoiceFilters = [
  <SearchInput key="q" source="q" alwaysOn />,
  <TextInput key="companyId" source="companyId" label="Company ID" />,
  <SelectInput
    key="status"
    source="status"
    label="Status"
    choices={INVOICE_STATUS_CHOICES}
  />,
];
