import { getCompany } from "@/actions/company";
import { CompanyForm } from "@/components/company/company-form";
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
            <p className="onboarding-eyebrow">Krok 1 · Firma</p>
            <h1>Nastavenie firmy</h1>
            <p>
              Údaje do hlavičky faktúry a platobného pásu. Neskôr ich upravíš vo
              Firma.
            </p>
          </div>

          <div className="onboarding-progress">
            <div className="onboarding-progress-meta">
              <span>
                Hotové{" "}
                <strong>
                  {c.completedRequired}/{c.totalRequired}
                </strong>
              </span>
              <strong className="data-num">{c.percentComplete}%</strong>
            </div>
            <div
              className="onboarding-progress-track"
              role="progressbar"
              aria-valuenow={c.percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Dokončenosť povinných údajov"
            >
              <div
                className="onboarding-progress-fill"
                style={{ width: `${c.percentComplete}%` }}
              />
            </div>
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
          </div>

          <CompanyForm initial={company} mode="onboarding" />
        </main>
      </div>
    </div>
  );
}
