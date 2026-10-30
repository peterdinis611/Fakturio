import { Building2, CalendarDays, Mail, ShieldCheck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/features/auth/api/auth";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { ProfileSignOut } from "@/features/profile/ui/profile-sign-out";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { emptyDash, formatDateTime } from "@/shared/lib/format";
import { Link, redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata() {
  const t = await getTranslations("Profile");
  return { title: t("title") };
}

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
  const t = await getTranslations("Profile");
  const locale = (await getLocale()) as AppLocale;
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
        title={t("title")}
        description={t("description")}
        actions={<ProfileSignOut />}
      />

      <Card size="sm" className="overflow-hidden rounded-[6px] bg-surface ring-border">
        <CardHeader className="border-b border-rule bg-raised/30">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar aria-hidden size="xl">
              <AvatarFallback>{mark}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="truncate text-[17px]">{displayName}</CardTitle>
                <Badge
                  variant="outline"
                  className="rounded-[4px] border-ring/35 text-[10px] tracking-[0.08em] text-ring uppercase"
                >
                  {t("active")}
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
            <Field label={t("firstName")} value={emptyDash(user.firstName)} />
            <Field label={t("lastName")} value={emptyDash(user.lastName)} />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-2.5">
              <CalendarDays
                className="mt-0.5 size-3.5 shrink-0 text-faint"
                aria-hidden
              />
              <Field
                label={t("created")}
                value={formatDateTime(user.createdAt, locale)}
                mono
              />
            </div>
            <div className="flex gap-2.5">
              <ShieldCheck
                className="mt-0.5 size-3.5 shrink-0 text-faint"
                aria-hidden
              />
              <Field
                label={t("lastSeen")}
                value={
                  user.lastSeenAt
                    ? formatDateTime(user.lastSeenAt, locale)
                    : emptyDash(null)
                }
                mono
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-rule bg-raised/20">
          <p className="text-[12px] text-muted-foreground">{t("companyHint")}</p>
          <Button asChild variant="secondary" size="sm">
            <Link href="/settings/company">
              <Building2 className="size-3.5" aria-hidden />
              {t("setCompany")}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
