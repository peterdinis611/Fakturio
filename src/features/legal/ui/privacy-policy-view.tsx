import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteLegal } from "@/shared/legal/site-legal";
import { LocaleSwitcher } from "@/shared/i18n/ui/locale-switcher";
import { AuthThemeSlot } from "@/widgets/landing/auth-theme-slot";
import "./legal-doc.css";

const SECTION_IDS = [
  "controller",
  "scope",
  "data",
  "purposes",
  "legalBasis",
  "recipients",
  "retention",
  "rights",
  "cookies",
  "security",
  "transfers",
  "changes",
  "contact",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

function formatEffectiveDate(iso: string, locale: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export async function PrivacyPolicyView({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Privacy" });
  const legal = getSiteLegal();
  const effective = formatEffectiveDate(legal.effectiveDateIso, locale);

  const bullets = (key: string) => {
    const raw = t.raw(key);
    return Array.isArray(raw) ? (raw as string[]) : [];
  };

  return (
    <article className="legal-doc">
      <div className="legal-doc__top">
        <Link href="/" className="legal-doc__brand">
          <span aria-hidden>F</span>
          {legal.productName}
        </Link>
        <div className="legal-doc__actions">
          <LocaleSwitcher compact />
          <AuthThemeSlot />
        </div>
      </div>

      <header className="legal-doc__hero">
        <p className="legal-doc__eyebrow">{t("eyebrow")}</p>
        <h1 className="legal-doc__title">{t("title")}</h1>
        <p className="legal-doc__lead">{t("lead")}</p>
        <p className="legal-doc__meta">
          <span>
            {t("effectiveLabel")}{" "}
            <time dateTime={legal.effectiveDateIso}>{effective}</time>
          </span>
          <span aria-hidden>·</span>
          <span>{t("version")}</span>
        </p>
      </header>

      <nav className="legal-doc__toc" aria-label={t("tocLabel")}>
        <p className="legal-doc__toc-title">{t("tocLabel")}</p>
        <ol>
          {SECTION_IDS.map((id, index) => (
            <li key={id}>
              <a href={`#${id}`}>
                <em>{String(index + 1).padStart(2, "0")}</em>
                {t(`sections.${id}.title`)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="legal-doc__body">
        {(SECTION_IDS as readonly SectionId[]).map((id, index) => {
          const items = bullets(`sections.${id}.items`);
          const body = t(`sections.${id}.body`);
          const body2Key = `sections.${id}.body2` as const;
          const hasBody2 = t.has(body2Key);

          return (
            <section
              key={id}
              id={id}
              className="legal-doc__section"
              aria-labelledby={`${id}-heading`}
            >
              <h2 id={`${id}-heading`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {t(`sections.${id}.title`)}
              </h2>

              {id === "controller" ? (
                <dl className="legal-doc__facts">
                  <div>
                    <dt>{t("facts.controller")}</dt>
                    <dd>{legal.controllerName}</dd>
                  </div>
                  {legal.controllerIco ? (
                    <div>
                      <dt>{t("facts.ico")}</dt>
                      <dd className="data-num">{legal.controllerIco}</dd>
                    </div>
                  ) : null}
                  {legal.address ? (
                    <div>
                      <dt>{t("facts.address")}</dt>
                      <dd>{legal.address}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>{t("facts.email")}</dt>
                    <dd>
                      <a href={`mailto:${legal.privacyEmail}`}>
                        {legal.privacyEmail}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt>{t("facts.jurisdiction")}</dt>
                    <dd>{legal.jurisdiction}</dd>
                  </div>
                </dl>
              ) : null}

              {body ? <p>{body}</p> : null}
              {hasBody2 ? <p>{t(body2Key)}</p> : null}

              {items.length > 0 ? (
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}

              {id === "rights" && t.has("sections.rights.action") ? (
                <p className="legal-doc__action">
                  {t("sections.rights.action")}{" "}
                  <Link href="/profile#gdpr">
                    {t("sections.rights.actionHrefLabel")}
                  </Link>
                </p>
              ) : null}
            </section>
          );
        })}
      </div>

      <p className="legal-doc__note">{t("footnote")}</p>
    </article>
  );
}
