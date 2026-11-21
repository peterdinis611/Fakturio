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
} from "@/shared/icons";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/features/auth/api/auth";
import { getCompany } from "@/features/company/api/company";
import { GdprPanel } from "@/features/gdpr/ui/gdpr-panel";
import { LogoUploader } from "@/features/profile/ui/logo-uploader";
import { ProfileAccountForm } from "@/features/profile/ui/profile-account-form";
import { ProfileAvatar } from "@/features/integrations/ui/profile-avatar";
import { ProfilePasswordForm } from "@/features/profile/ui/profile-password-form";
import { ProfileSection } from "@/features/profile/ui/profile-section";
import { ProfileSignOut } from "@/features/profile/ui/profile-sign-out";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { Badge } from "@/shared/ui/badge";
import { emptyDash, formatDateTime } from "@/shared/lib/format";
import { redirect } from "@/i18n/navigation";
import { ServerLink as Link } from "@/i18n/server-link";
import type { AppLocale } from "@/i18n/routing";
import "@/features/profile/ui/profile.css";

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

  const shortcuts = [
    { href: "/settings/company", label: t("setCompany"), Icon: Building2 },
    { href: "/settings/appearance", label: t("openAppearance"), Icon: Palette },
    { href: "/settings", label: t("openSettings"), Icon: Settings2 },
    { href: "/privacy", label: t("openPrivacy"), Icon: Scale },
    { href: "/terms", label: t("openTerms"), Icon: ScrollText },
    { href: "/support", label: t("openSupport"), Icon: LifeBuoy },
  ] as const;

  return (
    <div className="profile-dossier">
      <div className="profile-reveal">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={<ProfileSignOut />}
        />
      </div>

      <section
        className="profile-identity profile-reveal"
        data-delay={1}
        aria-label={displayName}
      >
        <div className="profile-monogram" aria-hidden>
          <ProfileAvatar
            email={user.email}
            fallback={mark}
            className="absolute inset-0 size-full rounded-[5px] object-cover"
          />
        </div>
        <div className="profile-identity-copy">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="profile-identity-name">{displayName}</h2>
            <Badge
              variant="outline"
              className="rounded-[4px] border-ring/40 text-[10px] tracking-[0.1em] text-ring uppercase"
            >
              {t("active")}
            </Badge>
          </div>
          <p className="profile-identity-mail">
            <Mail className="size-3.5 shrink-0" aria-hidden />
            <span>{user.email}</span>
          </p>

          <div className="profile-meta">
            <div className="profile-meta-item">
              <span className="profile-meta-icon" aria-hidden>
                <CalendarDays className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="profile-meta-label">{t("created")}</p>
                <p className="profile-meta-value data-num">
                  {formatDateTime(user.createdAt, locale)}
                </p>
              </div>
            </div>
            <div className="profile-meta-item">
              <span className="profile-meta-icon" aria-hidden>
                <ShieldCheck className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="profile-meta-label">{t("lastSeen")}</p>
                <p className="profile-meta-value data-num">
                  {user.lastSeenAt
                    ? formatDateTime(user.lastSeenAt, locale)
                    : emptyDash(null)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="profile-stack">
        <ProfileSection
          index="01"
          title={t("sectionAccount")}
          description={t("sectionAccountHint")}
          delay={2}
        >
          <ProfileAccountForm user={user} />
        </ProfileSection>

        <ProfileSection
          index="02"
          title={t("sectionSecurity")}
          description={t("sectionSecurityHint")}
          delay={3}
        >
          <ProfilePasswordForm userId={user.id} />
        </ProfileSection>

        <ProfileSection
          index="03"
          title={t("sectionLogo")}
          description={t("sectionLogoHint")}
          delay={4}
        >
          <LogoUploader logoUrl={company.logoUrl} />
        </ProfileSection>

        <ProfileSection
          index="04"
          title={t("sectionGdpr")}
          description={t("sectionGdprHint")}
          delay={5}
        >
          <GdprPanel />
        </ProfileSection>

        <ProfileSection
          index="05"
          title={t("sectionShortcuts")}
          description={t("sectionShortcutsHint")}
          delay={6}
        >
          <nav className="profile-links" aria-label={t("sectionShortcuts")}>
            {shortcuts.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="profile-link">
                <span className="profile-link-icon" aria-hidden>
                  <Icon className="size-3.5" />
                </span>
                {label}
              </Link>
            ))}
          </nav>
          <p className="profile-hint">{t("companyHint")}</p>
        </ProfileSection>
      </div>
    </div>
  );
}
