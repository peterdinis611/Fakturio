import {
  Building2,
  CalendarDays,
  LifeBuoy,
  Mail,
  Palette,
  Scale,
  ScrollText,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/features/auth/api/auth";
import { getCompany } from "@/features/company/api/company";
import { LogoUploader } from "@/features/profile/ui/logo-uploader";
import { ProfileAccountForm } from "@/features/profile/ui/profile-account-form";
import { ProfilePasswordForm } from "@/features/profile/ui/profile-password-form";
import { ProfileSection } from "@/features/profile/ui/profile-section";
import { ProfileSignOut } from "@/features/profile/ui/profile-sign-out";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
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

export default async function ProfilePage() {
  const t = await getTranslations("Profile");
  const locale = (await getLocale()) as AppLocale;
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/sign-in", locale });
    return null;
  }

  const company = await getCompany();
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const mark = initials(user.firstName, user.lastName, user.email);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={<ProfileSignOut />}
      />

      <Card
        size="sm"
        className="overflow-hidden rounded-[6px] bg-surface ring-border"
      >
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
        <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
          <div className="flex gap-2.5">
            <CalendarDays
              className="mt-0.5 size-3.5 shrink-0 text-faint"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                {t("created")}
              </p>
              <p className="mt-1 data-num text-[13px] text-ink">
                {formatDateTime(user.createdAt, locale)}
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0 text-faint"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
                {t("lastSeen")}
              </p>
              <p className="mt-1 data-num text-[13px] text-ink">
                {user.lastSeenAt
                  ? formatDateTime(user.lastSeenAt, locale)
                  : emptyDash(null)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileSection
        index="01"
        title={t("sectionAccount")}
        description={t("sectionAccountHint")}
      >
        <ProfileAccountForm user={user} />
      </ProfileSection>

      <ProfileSection
        index="02"
        title={t("sectionSecurity")}
        description={t("sectionSecurityHint")}
      >
        <ProfilePasswordForm userId={user.id} />
      </ProfileSection>

      <ProfileSection
        index="03"
        title={t("sectionLogo")}
        description={t("sectionLogoHint")}
      >
        <LogoUploader logoUrl={company.logoUrl} />
      </ProfileSection>

      <ProfileSection
        index="04"
        title={t("sectionShortcuts")}
        description={t("sectionShortcutsHint")}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild variant="secondary" className="justify-start">
            <Link href="/settings/company">
              <Building2 className="size-3.5" aria-hidden />
              {t("setCompany")}
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link href="/settings/appearance">
              <Palette className="size-3.5" aria-hidden />
              {t("openAppearance")}
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link href="/settings">
              <Settings2 className="size-3.5" aria-hidden />
              {t("openSettings")}
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link href="/privacy">
              <Scale className="size-3.5" aria-hidden />
              {t("openPrivacy")}
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link href="/terms">
              <ScrollText className="size-3.5" aria-hidden />
              {t("openTerms")}
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link href="/support">
              <LifeBuoy className="size-3.5" aria-hidden />
              {t("openSupport")}
            </Link>
          </Button>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">{t("companyHint")}</p>
      </ProfileSection>
    </div>
  );
}
