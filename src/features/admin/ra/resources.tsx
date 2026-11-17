"use client";

import {
  Datagrid,
  DateField,
  Edit,
  EditButton,
  EmailField,
  List,
  NumberField,
  BooleanInput,
  SimpleForm,
  TextField,
  TextInput,
  BooleanField,
  Show,
  SimpleShowLayout,
  TopToolbar,
  Button,
  useNotify,
  useRefresh,
  useRecordContext,
  DeleteButton,
} from "react-admin";
import {
  companyScopedFilters,
  invoiceFilters,
  listFilters,
} from "./filters";

export function ShowActions({
  withEdit = false,
  withDelete = false,
}: {
  withEdit?: boolean;
  withDelete?: boolean;
}) {
  return (
    <TopToolbar>
      {withEdit ? <EditButton /> : null}
      {withDelete ? <DeleteButton mutationMode="pessimistic" /> : null}
    </TopToolbar>
  );
}

export function UserList() {
  return (
    <List filters={listFilters} sort={{ field: "createdAt", order: "DESC" }}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <EmailField source="email" />
        <TextField source="firstName" />
        <TextField source="lastName" />
        <TextField source="companyName" />
        <BooleanField source="isAdmin" />
        <DateField source="createdAt" showTime />
        <DateField source="lastSeenAt" showTime />
        <EditButton />
      </Datagrid>
    </List>
  );
}

function RevokeSessionsButton() {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  if (!record?.id) return null;

  return (
    <Button
      label="Revoke sessions"
      onClick={async () => {
        const res = await fetch(`/api/ra/users/${record.id}/revoke-sessions`, {
          method: "POST",
          credentials: "same-origin",
        });
        if (!res.ok) {
          notify("Failed to revoke sessions", { type: "warning" });
          return;
        }
        notify("Sessions revoked — user must log in again", { type: "info" });
        refresh();
      }}
    />
  );
}

export function UserEdit() {
  return (
    <Edit
      actions={
        <TopToolbar>
          <RevokeSessionsButton />
          <DeleteButton mutationMode="pessimistic" />
        </TopToolbar>
      }
    >
      <SimpleForm>
        <TextInput source="email" />
        <TextInput source="firstName" />
        <TextInput source="lastName" />
      </SimpleForm>
    </Edit>
  );
}

export function UserShow() {
  return (
    <Show
      actions={
        <TopToolbar>
          <EditButton />
          <RevokeSessionsButton />
        </TopToolbar>
      }
    >
      <SimpleShowLayout>
        <TextField source="id" />
        <EmailField source="email" />
        <TextField source="firstName" />
        <TextField source="lastName" />
        <TextField source="companyName" />
        <BooleanField source="isAdmin" />
        <DateField source="createdAt" showTime />
        <DateField source="lastSeenAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function CompanyList() {
  return (
    <List filters={listFilters} sort={{ field: "createdAt", order: "DESC" }}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="name" />
        <TextField source="ico" />
        <TextField source="userEmail" />
        <TextField source="city" />
        <TextField source="country" />
        <BooleanField source="isVatPayer" />
        <BooleanField source="hasFioBankToken" />
        <DateField source="createdAt" showTime />
        <EditButton />
      </Datagrid>
    </List>
  );
}

export function CompanyEdit() {
  return (
    <Edit mutationMode="pessimistic">
      <SimpleForm>
        <TextInput source="name" required />
        <TextInput source="email" type="email" />
        <TextInput source="city" />
        <TextInput source="country" helperText="2-letter ISO code, e.g. SK" />
        <BooleanInput source="isVatPayer" />
      </SimpleForm>
    </Edit>
  );
}

export function CompanyShow() {
  return (
    <Show actions={<ShowActions withEdit />}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="ico" />
        <TextField source="dic" />
        <TextField source="icDph" />
        <TextField source="userEmail" />
        <TextField source="email" />
        <TextField source="city" />
        <TextField source="country" />
        <TextField source="bankIban" />
        <BooleanField source="isVatPayer" />
        <BooleanField source="hasFioBankToken" />
        <DateField source="createdAt" showTime />
        <DateField source="updatedAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function InvoiceList() {
  return (
    <List filters={invoiceFilters} sort={{ field: "issueDate", order: "DESC" }}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="number" />
        <TextField source="companyName" />
        <TextField source="customerName" />
        <TextField source="status" />
        <TextField source="documentType" />
        <NumberField source="total" />
        <TextField source="currency" />
        <DateField source="issueDate" />
        <DateField source="dueDate" />
      </Datagrid>
    </List>
  );
}

export function InvoiceShow() {
  return (
    <Show actions={<ShowActions withDelete />}>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="number" />
        <TextField source="companyName" />
        <TextField source="customerName" />
        <TextField source="status" />
        <TextField source="documentType" />
        <TextField source="flow" />
        <NumberField source="total" />
        <TextField source="currency" />
        <DateField source="issueDate" />
        <DateField source="dueDate" />
        <DateField source="createdAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function CustomerList() {
  return (
    <List filters={companyScopedFilters} sort={{ field: "createdAt", order: "DESC" }}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="name" />
        <TextField source="ico" />
        <TextField source="companyName" />
        <EmailField source="email" />
        <TextField source="city" />
        <TextField source="country" />
        <DateField source="createdAt" showTime />
      </Datagrid>
    </List>
  );
}

export function CustomerShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="ico" />
        <TextField source="companyName" />
        <EmailField source="email" />
        <TextField source="city" />
        <TextField source="country" />
        <DateField source="createdAt" showTime />
      </SimpleShowLayout>
    </Show>
  );
}

export function AuditLogList() {
  return (
    <List filters={listFilters} sort={{ field: "occurredAt", order: "DESC" }}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <DateField source="occurredAt" showTime />
        <TextField source="action" />
        <TextField source="entityType" />
        <TextField source="entityNumber" />
        <TextField source="actorEmail" />
        <TextField source="summary" />
      </Datagrid>
    </List>
  );
}

export function AuditLogShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <DateField source="occurredAt" showTime />
        <TextField source="action" />
        <TextField source="entityType" />
        <TextField source="entityId" />
        <TextField source="entityNumber" />
        <TextField source="actorEmail" />
        <TextField source="actorDisplayName" />
        <TextField source="summary" />
        <TextField source="companyId" />
      </SimpleShowLayout>
    </Show>
  );
}
