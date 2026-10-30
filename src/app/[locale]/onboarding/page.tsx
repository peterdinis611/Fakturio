import { InfoIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCompany } from "@/features/company/api/company";
import { CompanyForm } from "@/features/company/ui/company-form";
import { SkipOnboardingButton } from "@/features/company/ui/skip-onboarding-button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Separator } from "@/shared/ui/separator";
import { Link } from "@/i18n/navigation";
import "./onboarding.css";

export async function generateMetadata() {
  const t = await getTranslations("Onboarding");
  return { title: t("title") };
}

export default async function OnboardingPage() {
  const t = await getTranslations("Onboarding");
  const company = await getCompany();
  const c = company.completeness;
  const required = c.items.filter((i) => i.isRequired);

  return (
    <div className="onboarding-shell">
      <div className="onboarding-frame">
        <aside className="onboarding-aside">
          <Link href="/" className="onboarding-brand">
            <span aria-hidden>F</span>
            Fakturio
          </Link>

          <div className="onboarding-aside-copy">
            <Badge
              variant="outline"
              className="rounded-[4px] border-ring/40 text-[10px] tracking-[0.12em] text-ring uppercase"
            >
              {t("stepCompany")}
            </Badge>
            <h1>{t("title")}</h1>
            <p>
              Údaje do hlavičky faktúry a platobného pásu. Neskôr ich upravíš vo
              Firma.
            </p>
          </div>

          <div className="onboarding-progress space-y-2">
            <div className="onboarding-progress-meta">
              <span>
                {t("done")}{" "}
                <strong>
                  {c.completedRequired}/{c.totalRequired}
                </strong>
              </span>
              <Badge variant="secondary" className="rounded-[4px] data-num">
                {c.percentComplete}%
              </Badge>
            </div>
            <Progress value={c.percentComplete} aria-label={t("done")} />
          </div>

          <ul className="onboarding-checklist">
            {required.map((item) => (
              <li key={item.key} data-done={item.isComplete ? "true" : "false"}>
                <span className="onboarding-check" aria-hidden>
                  {item.isComplete ? "✓" : ""}
                </span>
                <span>
                  {item.label}
                  {item.hint ? (
                    <span className="block text-[11px] text-faint">
                      {item.hint}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          <Separator />

          <Alert className="border-border bg-raised/40">
            <InfoIcon />
            <AlertTitle>{t("skipHint")}</AlertTitle>
            <AlertDescription>{t("skipToast")}</AlertDescription>
          </Alert>

          <SkipOnboardingButton />
        </aside>

        <main className="onboarding-main">
          <div className="onboarding-main-mobile-head">
            <Link href="/" className="onboarding-brand">
              <span aria-hidden>F</span>
              Fakturio
            </Link>
            <h1>{t("title")}</h1>
            <p>
              {t("done")} {c.completedRequired} / {c.totalRequired} ·{" "}
              {c.percentComplete}%
            </p>
            <div className="mt-3">
              <SkipOnboardingButton />
            </div>
          </div>

          <CompanyForm initial={company} mode="onboarding" />
        </main>
      </div>
    </div>
  );
}
