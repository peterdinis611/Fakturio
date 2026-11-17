"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import {
  BooleanInput,
  Edit,
  NumberInput,
  SimpleForm,
  useRedirect,
} from "react-admin";

/** Singleton resource: the "list" route just jumps to the one editable record. */
export function JobSettingsRedirect() {
  const redirect = useRedirect();
  useEffect(() => {
    redirect("edit", "job-settings", "current");
  }, [redirect]);
  return null;
}

function Section({ title, hint }: { title: string; hint?: string }) {
  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      {hint ? (
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      ) : null}
      <Divider sx={{ mt: 1, mb: 1 }} />
    </Box>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: 2,
        width: "100%",
      }}
    >
      {children}
    </Box>
  );
}

export function JobSettingsEdit() {
  return (
    <Edit
      id="current"
      resource="job-settings"
      title="Background jobs"
      mutationMode="pessimistic"
      redirect={false}
      // Keep read-only run statuses from the loaded record in the PUT body.
      transform={(data, options) => ({ ...options?.previousData, ...data })}
    >
      <SimpleForm>
        <Section
          title="Overdue sync"
          hint="Marks issued invoices as overdue after their due date."
        />
        <Row>
          <BooleanInput source="settings.overdueSync.enabled" label="Enabled" />
          <BooleanInput
            source="settings.overdueSync.runOnStartup"
            label="Run on startup"
          />
        </Row>
        <Row>
          <NumberInput
            source="settings.overdueSync.runAtHourUtc"
            label="Run at hour (UTC)"
            min={0}
            max={23}
          />
          <NumberInput
            source="settings.overdueSync.runAtMinuteUtc"
            label="Run at minute (UTC)"
            min={0}
            max={59}
          />
          <NumberInput
            source="settings.overdueSync.startupDelaySeconds"
            label="Startup delay (s)"
            min={0}
          />
          <NumberInput
            source="settings.overdueSync.disabledRecheckHours"
            label="Disabled re-check (h)"
            min={1}
          />
        </Row>

        <Section
          title="Reminder job"
          hint="Creates in-app notifications for invoices nearing or past their due date."
        />
        <Row>
          <BooleanInput source="settings.reminderJob.enabled" label="Enabled" />
          <BooleanInput
            source="settings.reminderJob.runOnStartup"
            label="Run on startup"
          />
          <BooleanInput
            source="settings.reminderJob.onlyOverdue"
            label="Only overdue"
          />
          <BooleanInput
            source="settings.reminderJob.markAsSent"
            label="Mark as sent"
          />
        </Row>
        <Row>
          <NumberInput
            source="settings.reminderJob.runAtHourUtc"
            label="Run at hour (UTC)"
            min={0}
            max={23}
          />
          <NumberInput
            source="settings.reminderJob.runAtMinuteUtc"
            label="Run at minute (UTC)"
            min={0}
            max={59}
          />
          <NumberInput
            source="settings.reminderJob.startupDelaySeconds"
            label="Startup delay (s)"
            min={0}
          />
          <NumberInput
            source="settings.reminderJob.disabledRecheckHours"
            label="Disabled re-check (h)"
            min={1}
          />
          <NumberInput
            source="settings.reminderJob.withinDays"
            label="Within days"
            min={0}
          />
          <NumberInput
            source="settings.reminderJob.minDaysBetweenReminders"
            label="Min days between reminders"
            min={0}
          />
        </Row>

        <Section
          title="Recurring invoices"
          hint="Generates draft invoices from recurring templates."
        />
        <Row>
          <BooleanInput
            source="settings.recurringInvoices.enabled"
            label="Enabled"
          />
          <NumberInput
            source="settings.recurringInvoices.intervalHours"
            label="Interval (h)"
            min={1}
          />
          <NumberInput
            source="settings.recurringInvoices.startupDelaySeconds"
            label="Startup delay (s)"
            min={0}
          />
          <NumberInput
            source="settings.recurringInvoices.disabledRecheckHours"
            label="Disabled re-check (h)"
            min={1}
          />
        </Row>
      </SimpleForm>
    </Edit>
  );
}
