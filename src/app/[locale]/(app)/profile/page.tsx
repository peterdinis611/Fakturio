import { Building2, CalendarDays, Mail, ShieldCheck } from "lucide-react";
import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/actions/auth";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileSignOut } from "@/components/profile/profile-sign-out";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { emptyDash, formatDateTime } from "@/lib/format";
import { Link, redirect } from "@/i18n/navigation";

export const metadata = { title: "Profil" };

function initials(firstName: string | null, lastName: string | null, email: string) {
  const a = firstName?.trim()?.[0];
  const b = lastName?.trim()?.[0];
  if (a && b) return `${a}${b}`.toUpperCase();
  if (a) return a.toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={
          mono
            ? "mt-1 data-num text-[13px] text-ink"
            : "mt-1 truncate text-[14px] font-medium text-ink"
        }
      >
        {value}
      </p>
    </div>
  );
}

export default async function ProfilePage() {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/sign-in", locale });
    return null;
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const mark = initials(user.firstName, user.lastName, user.email);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Profil"
        description="Údaje prihláseného účtu a rýchle akcie."
        actions={<ProfileSignOut />}
      />

      <Card size="sm" className="overflow-hidden rounded-[6px] bg-surface ring-border">
        <CardHeader className="border-b border-rule bg-raised/30">
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="grid size-14 shrink-0 place-items-center rounded-[6px] border border-border bg-ground font-mono text-[15px] font-bold tracking-wide text-ink"
              aria-hidden
            >
              {mark}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="truncate text-[17px]">{displayName}</CardTitle>
                <Badge
                  variant="outline"
                  className="rounded-[4px] border-ring/35 text-[10px] tracking-[0.08em] text-ring uppercase"
                >
                  Aktívny
                </Badge>
              </div>
              <CardDescription className="mt-1 flex items-center gap-1.5 truncate">
                <Mail className="size-3.5 shrink-0" aria-hidden />
                {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meno" value={emptyDash(user.firstName)} />
            <Field label="Priezvisko" value={emptyDash(user.lastName)} />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-2.5">
              <CalendarDays
                className="mt-0.5 size-3.5 shrink-0 text-faint"
                aria-hidden
              />
              <Field
                label="Účet vytvorený"
                value={formatDateTime(user.createdAt)}
                mono
              />
            </div>
            <div className="flex gap-2.5">
              <ShieldCheck
                className="mt-0.5 size-3.5 shrink-0 text-faint"
                aria-hidden
              />
              <Field
                label="Posledná aktivita"
                value={
                  user.lastSeenAt
                    ? formatDateTime(user.lastSeenAt)
                    : emptyDash(null)
                }
                mono
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-rule bg-raised/20">
          <p className="text-[12px] text-muted-foreground">
            Firemné údaje na faktúrach upravíš vo Firma.
          </p>
          <Button asChild variant="secondary" size="sm">
            <Link href="/settings/company">
              <Building2 className="size-3.5" aria-hidden />
              Nastaviť firmu
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
