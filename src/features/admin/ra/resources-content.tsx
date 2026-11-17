"use client";

import {
  BooleanField,
  Datagrid,
  DateField,
  DeleteButton,
  List,
  NumberField,
  Show,
  SimpleShowLayout,
  TextField,
} from "react-admin";
import { companyScopedFilters } from "./filters";
import { ShowActions } from "./resources";

/* ── Notes ─────────────────────────────────────────────── */

export function NoteList() {
  return (
    <List
      filters={companyScopedFilters}
      sort={{ field: "createdAt", order: "DESC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="title" />
        <TextField source="companyName" />
        <BooleanField source="isPinned" />
        <DateField source="updatedAt" showTime />
        <DeleteButton mutationMode="pessimistic" />
      </Datagrid>
    </List>
  );
}

export function NoteShow() {
  return (
    <Show actions={<ShowActions withDelete />}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="title" />
        <TextField source="body" />
        <BooleanField source="isPinned" />
        <TextField source="companyName" />
        <TextField source="companyId" />
        <DateField source="createdAt" showTime />
        <DateField source="updatedAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

/* ── Catalog items ─────────────────────────────────────── */

export function CatalogItemList() {
  return (
    <List
      filters={companyScopedFilters}
      sort={{ field: "createdAt", order: "DESC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="description" />
        <TextField source="companyName" />
        <TextField source="unit" />
        <NumberField source="unitPrice" />
        <NumberField source="vatRate" />
        <BooleanField source="isActive" />
        <DeleteButton mutationMode="pessimistic" />
      </Datagrid>
    </List>
  );
}

export function CatalogItemShow() {
  return (
    <Show actions={<ShowActions withDelete />}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="description" />
        <TextField source="companyName" />
        <TextField source="companyId" />
        <TextField source="unit" />
        <NumberField source="unitPrice" />
        <NumberField source="vatRate" />
        <BooleanField source="isActive" />
        <NumberField source="sortOrder" />
        <DateField source="createdAt" showTime />
        <DateField source="updatedAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

/* ── Recurring invoices ────────────────────────────────── */

export function RecurringList() {
  return (
    <List
      filters={companyScopedFilters}
      sort={{ field: "createdAt", order: "DESC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="name" />
        <TextField source="companyName" />
        <TextField source="customerName" />
        <TextField source="interval" />
        <DateField source="nextRunOn" />
        <BooleanField source="isActive" />
        <DeleteButton mutationMode="pessimistic" />
      </Datagrid>
    </List>
  );
}

export function RecurringShow() {
  return (
    <Show actions={<ShowActions withDelete />}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="companyName" />
        <TextField source="companyId" />
        <TextField source="customerName" />
        <TextField source="customerId" />
        <TextField source="interval" />
        <NumberField source="dayOfMonth" />
        <NumberField source="dueDays" />
        <BooleanField source="isActive" />
        <DateField source="nextRunOn" />
        <DateField source="lastGeneratedOn" />
        <TextField source="lastInvoiceId" />
        <NumberField source="itemCount" />
        <TextField source="notes" />
        <DateField source="createdAt" showTime />
        <DateField source="updatedAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

/* ── Notifications ─────────────────────────────────────── */

export function NotificationList() {
  return (
    <List
      filters={companyScopedFilters}
      sort={{ field: "createdAt", order: "DESC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <DateField source="createdAt" showTime />
        <TextField source="kind" />
        <TextField source="title" />
        <TextField source="userEmail" />
        <TextField source="companyName" />
        <TextField source="invoiceNumber" />
        <BooleanField source="isRead" />
        <DeleteButton mutationMode="pessimistic" />
      </Datagrid>
    </List>
  );
}

export function NotificationShow() {
  return (
    <Show actions={<ShowActions withDelete />}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="kind" />
        <TextField source="title" />
        <TextField source="body" />
        <TextField source="href" />
        <TextField source="userEmail" />
        <TextField source="companyName" />
        <TextField source="invoiceNumber" />
        <TextField source="invoiceId" />
        <BooleanField source="isRead" />
        <DateField source="createdAt" showTime />
        <DateField source="readAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

/* ── Attachments (read-only) ───────────────────────────── */

export function AttachmentList() {
  return (
    <List
      filters={companyScopedFilters}
      sort={{ field: "createdAt", order: "DESC" }}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="fileName" />
        <TextField source="invoiceNumber" />
        <TextField source="companyName" />
        <TextField source="contentType" />
        <NumberField source="sizeBytes" />
        <DateField source="createdAt" showTime />
      </Datagrid>
    </List>
  );
}

export function AttachmentShow() {
  return (
    <Show actions={false}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="fileName" />
        <TextField source="contentType" />
        <NumberField source="sizeBytes" />
        <TextField source="invoiceNumber" />
        <TextField source="invoiceId" />
        <TextField source="companyName" />
        <TextField source="companyId" />
        <DateField source="createdAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
}
