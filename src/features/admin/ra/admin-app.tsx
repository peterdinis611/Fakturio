"use client";

import { Admin, Resource } from "react-admin";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ContactsIcon from "@mui/icons-material/Contacts";
import HistoryIcon from "@mui/icons-material/History";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import InventoryIcon from "@mui/icons-material/Inventory2";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SettingsIcon from "@mui/icons-material/Settings";
import { adminDataProvider } from "./data-provider";
import { AdminDashboard } from "./dashboard";
import { JobSettingsEdit, JobSettingsRedirect } from "./job-settings";
import {
  AuditLogList,
  AuditLogShow,
  CompanyEdit,
  CompanyList,
  CompanyShow,
  CustomerList,
  CustomerShow,
  InvoiceList,
  InvoiceShow,
  UserEdit,
  UserList,
  UserShow,
} from "./resources";
import {
  AttachmentList,
  AttachmentShow,
  CatalogItemList,
  CatalogItemShow,
  NoteList,
  NoteShow,
  NotificationList,
  NotificationShow,
  RecurringList,
  RecurringShow,
} from "./resources-content";

export function AdminAppLoaded({ basename }: { basename: string }) {
  return (
    <Admin
      dataProvider={adminDataProvider}
      basename={basename}
      requireAuth={false}
      dashboard={AdminDashboard}
      disableTelemetry
    >
      <Resource
        name="users"
        list={UserList}
        edit={UserEdit}
        show={UserShow}
        icon={PeopleIcon}
        options={{ label: "Users" }}
      />
      <Resource
        name="companies"
        list={CompanyList}
        edit={CompanyEdit}
        show={CompanyShow}
        icon={BusinessIcon}
        options={{ label: "Companies" }}
      />
      <Resource
        name="invoices"
        list={InvoiceList}
        show={InvoiceShow}
        icon={ReceiptIcon}
        options={{ label: "Invoices" }}
      />
      <Resource
        name="customers"
        list={CustomerList}
        show={CustomerShow}
        icon={ContactsIcon}
        options={{ label: "Customers" }}
      />
      <Resource
        name="recurring-invoices"
        list={RecurringList}
        show={RecurringShow}
        icon={EventRepeatIcon}
        options={{ label: "Recurring" }}
      />
      <Resource
        name="catalog-items"
        list={CatalogItemList}
        show={CatalogItemShow}
        icon={InventoryIcon}
        options={{ label: "Catalog items" }}
      />
      <Resource
        name="notes"
        list={NoteList}
        show={NoteShow}
        icon={StickyNote2Icon}
        options={{ label: "Notes" }}
      />
      <Resource
        name="notifications"
        list={NotificationList}
        show={NotificationShow}
        icon={NotificationsIcon}
        options={{ label: "Notifications" }}
      />
      <Resource
        name="attachments"
        list={AttachmentList}
        show={AttachmentShow}
        icon={AttachFileIcon}
        options={{ label: "Attachments" }}
      />
      <Resource
        name="audit-logs"
        list={AuditLogList}
        show={AuditLogShow}
        icon={HistoryIcon}
        options={{ label: "Audit logs" }}
      />
      <Resource
        name="job-settings"
        list={JobSettingsRedirect}
        edit={JobSettingsEdit}
        icon={SettingsIcon}
        options={{ label: "Background jobs" }}
      />
    </Admin>
  );
}
