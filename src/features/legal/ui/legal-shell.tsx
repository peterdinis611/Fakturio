import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/shared/i18n/ui/locale-switcher";
import { AuthThemeSlot } from "@/widgets/landing/auth-theme-slot";
import "./legal-doc.css";

type Props = {
  brand: string;
  eyebrow: string;
  title: string;
  lead: string;
  effectiveLabel?: string;
  effectiveIso?: string;
  effectiveFormatted?: string;
  version?: string;
  tocLabel?: string;
  toc?: Array<{ id: string; title: string }>;
  footnote?: string;
  children: React.ReactNode;
};

export function LegalShell({
  brand,
  eyebrow,
  title,
  lead,
  effectiveLabel,
  effectiveIso,
  effectiveFormatted,
  version,
  tocLabel,
  toc,
  footnote,
  children,
}: Props) {
  return (
    <article className="legal-doc">
      <div className="legal-doc__top">
        <Link href="/" className="legal-doc__brand">
          <span aria-hidden>F</span>
          {brand}
        </Link>
        <div className="legal-doc__actions">
          <LocaleSwitcher compact />
          <AuthThemeSlot />
        </div>
      </div>

      <header className="legal-doc__hero">
        <p className="legal-doc__eyebrow">{eyebrow}</p>
        <h1 className="legal-doc__title">{title}</h1>
        <p className="legal-doc__lead">{lead}</p>
        {effectiveLabel && effectiveIso && effectiveFormatted ? (
          <p className="legal-doc__meta">
            <span>
              {effectiveLabel}{" "}
              <time dateTime={effectiveIso}>{effectiveFormatted}</time>
            </span>
            {version ? (
              <>
                <span aria-hidden>·</span>
                <span>{version}</span>
              </>
            ) : null}
          </p>
        ) : null}
      </header>

      {toc && toc.length > 0 && tocLabel ? (
        <nav className="legal-doc__toc" aria-label={tocLabel}>
          <p className="legal-doc__toc-title">{tocLabel}</p>
          <ol>
            {toc.map((item, index) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>
                  <em>{String(index + 1).padStart(2, "0")}</em>
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="legal-doc__body">{children}</div>

      {footnote ? <p className="legal-doc__note">{footnote}</p> : null}
    </article>
  );
}

export function LegalSection({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="legal-doc__section"
      aria-labelledby={`${id}-heading`}
    >
      <h2 id={`${id}-heading`}>
        <span>{String(index + 1).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function formatLegalDate(iso: string, locale: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
