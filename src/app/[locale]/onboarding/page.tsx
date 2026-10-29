import { InfoIcon } from "lucide-react";
import { getCompany } from "@/actions/company";
import { CompanyForm } from "@/components/company/company-form";
import { SkipOnboardingButton } from "@/components/company/skip-onboarding-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import "./onboarding.css";

export const metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
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
              Krok 1 · Firma
            </Badge>
            <h1>Nastavenie firmy</h1>
            <p>
              Údaje do hlavičky faktúry a platobného pásu. Neskôr ich upravíš vo
              Firma.
            </p>
          </div>

          <div className="onboarding-progress space-y-2">
            <div className="onboarding-progress-meta">
              <span>
                Hotové{" "}
                <strong>
                  {c.completedRequired}/{c.totalRequired}
                </strong>
              </span>
              <Badge variant="secondary" className="rounded-[4px] data-num">
                {c.percentComplete}%
              </Badge>
            </div>
            <Progress value={c.percentComplete} aria-label="Dokončenosť" />
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
            <AlertTitle>Môžeš to doplniť neskôr</AlertTitle>
            <AlertDescription>
              Preskoč onboarding a firmu nastav vo Firma. Banner ti pripomenie
              chýbajúce údaje.
            </AlertDescription>
          </Alert>

          <SkipOnboardingButton />
        </aside>

        <main className="onboarding-main">
          <div className="onboarding-main-mobile-head">
            <Link href="/" className="onboarding-brand">
              <span aria-hidden>F</span>
              Fakturio
            </Link>
            <h1>Nastavenie firmy</h1>
            <p>
              Hotové {c.completedRequired} z {c.totalRequired} povinných ·{" "}
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
