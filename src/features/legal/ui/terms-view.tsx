import { getTranslations } from "next-intl/server";
import { getSiteLegal } from "@/shared/legal/site-legal";
import {
  LegalSection,
  LegalShell,
  formatLegalDate,
} from "@/features/legal/ui/legal-shell";

const SECTION_IDS = [
  "service",
  "account",
  "dataResponsibility",
  "availability",
  "fees",
  "liability",
  "termination",
  "law",
  "contact",
] as const;

export async function TermsView({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Terms" });
  const legal = getSiteLegal();
  const effective = formatLegalDate(legal.effectiveDateIso, locale);

  const bullets = (key: string) => {
    const raw = t.raw(key);
    return Array.isArray(raw) ? (raw as string[]) : [];
  };

  return (
    <LegalShell
      brand={legal.productName}
      eyebrow={t("eyebrow")}
      title={t("title")}
      lead={t("lead")}
      effectiveLabel={t("effectiveLabel")}
      effectiveIso={legal.effectiveDateIso}
      effectiveFormatted={effective}
      version={t("version")}
      tocLabel={t("tocLabel")}
      toc={SECTION_IDS.map((id) => ({
        id,
        title: t(`sections.${id}.title`),
      }))}
      footnote={t("footnote")}
    >
      {SECTION_IDS.map((id, index) => {
        const items = bullets(`sections.${id}.items`);
        const hasBody2 = t.has(`sections.${id}.body2`);
        return (
          <LegalSection
            key={id}
            id={id}
            index={index}
            title={t(`sections.${id}.title`)}
          >
            {id === "contact" ? (
              <dl className="legal-doc__facts">
                <div>
                  <dt>{t("facts.provider")}</dt>
                  <dd>{legal.controllerName}</dd>
                </div>
                <div>
                  <dt>{t("facts.email")}</dt>
                  <dd>
                    <a href={`mailto:${legal.contactEmail}`}>
                      {legal.contactEmail}
                    </a>
                  </dd>
                </div>
              </dl>
            ) : null}
            <p>{t(`sections.${id}.body`)}</p>
            {hasBody2 ? <p>{t(`sections.${id}.body2`)}</p> : null}
            {items.length > 0 ? (
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </LegalSection>
        );
      })}
    </LegalShell>
  );
}
