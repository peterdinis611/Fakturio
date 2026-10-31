import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteLegal } from "@/shared/legal/site-legal";
import {
  LegalSection,
  LegalShell,
} from "@/features/legal/ui/legal-shell";

const SECTION_IDS = ["contact", "response", "topics", "status", "legal"] as const;

export async function SupportView({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Support" });
  const legal = getSiteLegal();

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
      tocLabel={t("tocLabel")}
      toc={SECTION_IDS.map((id) => ({
        id,
        title: t(`sections.${id}.title`),
      }))}
      footnote={t("footnote")}
    >
      {SECTION_IDS.map((id, index) => {
        const items = bullets(`sections.${id}.items`);
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
                  <dt>{t("facts.email")}</dt>
                  <dd>
                    <a href={`mailto:${legal.contactEmail}`}>
                      {legal.contactEmail}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>{t("facts.privacy")}</dt>
                  <dd>
                    <a href={`mailto:${legal.privacyEmail}`}>
                      {legal.privacyEmail}
                    </a>
                  </dd>
                </div>
              </dl>
            ) : null}

            <p>{t(`sections.${id}.body`)}</p>

            {id === "legal" ? (
              <ul>
                <li>
                  <Link href="/privacy">{t("links.privacy")}</Link>
                </li>
                <li>
                  <Link href="/terms">{t("links.terms")}</Link>
                </li>
              </ul>
            ) : null}

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
