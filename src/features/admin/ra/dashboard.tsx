"use client";

import type { ReactElement } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ContactsIcon from "@mui/icons-material/Contacts";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import InventoryIcon from "@mui/icons-material/Inventory2";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import HistoryIcon from "@mui/icons-material/History";
import { Link, Title, useCreatePath, useGetOne } from "react-admin";

type Dashboard = {
  id: string;
  users: number;
  companies: number;
  customers: number;
  invoices: number;
  recurringTemplates: number;
  notes: number;
  catalogItems: number;
  notifications: number;
  attachments: number;
  auditLogs: number;
  draftInvoices: number;
  issuedInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  cancelledInvoices: number;
  openAmount: number;
  paidAmount: number;
  currency: string;
  generatedAtUtc: string;
};

const MIX = [
  { key: "draftInvoices", label: "Draft", color: "#9e9e9e" },
  { key: "issuedInvoices", label: "Issued", color: "#1565c0" },
  { key: "paidInvoices", label: "Paid", color: "#2e7d32" },
  { key: "overdueInvoices", label: "Overdue", color: "#c62828" },
  { key: "cancelledInvoices", label: "Cancelled", color: "#6d4c41" },
] as const;

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value)} ${currency}`;
  }
}

function StatCard({
  label,
  value,
  icon,
  to,
  accent,
}: {
  label: string;
  value: string | number | undefined;
  icon: ReactElement;
  to?: string;
  accent: string;
}) {
  const body = (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderLeft: `4px solid ${accent}`,
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": to
          ? { transform: "translateY(-2px)", boxShadow: 3 }
          : undefined,
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ color: accent, display: "flex" }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 1.2, lineHeight: 1.4, display: "block" }}
          >
            {label}
          </Typography>
          {value === undefined ? (
            <Skeleton width={64} height={36} />
          ) : (
            <Typography
              variant="h4"
              component="div"
              sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}
            >
              {value}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return to ? (
    <Box component={Link} to={to} sx={{ textDecoration: "none", color: "inherit" }}>
      {body}
    </Box>
  ) : (
    body
  );
}

function InvoiceMix({ data }: { data: Dashboard }) {
  const total = MIX.reduce((sum, m) => sum + (data[m.key] ?? 0), 0);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.2 }}>
          Invoice mix
        </Typography>
        <Box
          sx={{
            display: "flex",
            height: 18,
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "action.hover",
            my: 1.5,
          }}
        >
          {total > 0
            ? MIX.map((m) => {
                const count = data[m.key] ?? 0;
                if (!count) return null;
                return (
                  <Tooltip key={m.key} title={`${m.label}: ${count}`}>
                    <Box
                      sx={{ width: `${(count / total) * 100}%`, bgcolor: m.color }}
                    />
                  </Tooltip>
                );
              })
            : null}
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
          {MIX.map((m) => (
            <Box key={m.key} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: m.color }} />
              <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                {m.label} · {data[m.key] ?? 0}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mt: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Open (issued + overdue)
            </Typography>
            <Typography variant="h5" sx={{ fontVariantNumeric: "tabular-nums" }}>
              {formatMoney(data.openAmount, data.currency)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Paid
            </Typography>
            <Typography variant="h5" sx={{ fontVariantNumeric: "tabular-nums" }}>
              {formatMoney(data.paidAmount, data.currency)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const createPath = useCreatePath();
  const { data, isPending, error } = useGetOne<Dashboard>("dashboard", {
    id: "current",
  });

  const to = (resource: string) => createPath({ resource, type: "list" });

  const stats: {
    label: string;
    key: keyof Dashboard;
    icon: ReactElement;
    resource?: string;
    accent: string;
  }[] = [
    { label: "Users", key: "users", icon: <PeopleIcon />, resource: "users", accent: "#1565c0" },
    { label: "Companies", key: "companies", icon: <BusinessIcon />, resource: "companies", accent: "#00695c" },
    { label: "Invoices", key: "invoices", icon: <ReceiptIcon />, resource: "invoices", accent: "#ef6c00" },
    { label: "Customers", key: "customers", icon: <ContactsIcon />, resource: "customers", accent: "#6a1b9a" },
    { label: "Recurring", key: "recurringTemplates", icon: <EventRepeatIcon />, resource: "recurring-invoices", accent: "#00838f" },
    { label: "Notes", key: "notes", icon: <StickyNote2Icon />, resource: "notes", accent: "#f9a825" },
    { label: "Catalog items", key: "catalogItems", icon: <InventoryIcon />, resource: "catalog-items", accent: "#558b2f" },
    { label: "Notifications", key: "notifications", icon: <NotificationsIcon />, resource: "notifications", accent: "#ad1457" },
    { label: "Attachments", key: "attachments", icon: <AttachFileIcon />, resource: "attachments", accent: "#4e342e" },
    { label: "Audit logs", key: "auditLogs", icon: <HistoryIcon />, resource: "audit-logs", accent: "#37474f" },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Title title="Platform overview" />
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not load dashboard stats.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            lg: "repeat(5, 1fr)",
          },
        }}
      >
        {stats.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            icon={s.icon}
            accent={s.accent}
            to={s.resource ? to(s.resource) : undefined}
            value={
              isPending || !data ? undefined : (data[s.key] as number | undefined) ?? 0
            }
          />
        ))}
      </Box>

      <Box sx={{ mt: 2 }}>
        {isPending || !data ? (
          <Skeleton variant="rounded" height={190} />
        ) : (
          <InvoiceMix data={data} />
        )}
      </Box>

      {data?.generatedAtUtc ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Generated {new Date(data.generatedAtUtc).toLocaleString()}
        </Typography>
      ) : null}
    </Box>
  );
}
