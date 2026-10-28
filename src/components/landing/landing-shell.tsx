"use client";

import { Link } from "@/i18n/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import {
  Banknote,
  Bell,
  Briefcase,
  Check,
  FileSpreadsheet,
  Laptop,
  Menu,
  Package,
  Receipt,
  Shield,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import {
  LandingCtaActions,
  LandingHeroActions,
  LandingNavActions,
} from "@/components/landing/auth-actions";
import {
  LandingReveal,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/landing/landing-reveal";
import {
  LandingCashflowCard,
  LandingPreview,
} from "@/components/landing/landing-preview";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function ParallaxFloat({
  className,
  children,
}: {
  className: string;
  children: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 18 });
  const sy = useSpring(y, { stiffness: 120, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: globalThis.MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 18;
      const ny = (e.clientY / window.innerHeight - 0.5) * 14;
      x.set(nx);
      y.set(ny);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, x, y]);

  return (
    <motion.div
      className={className}
      style={reduce ? undefined : { x: sx, y: sy }}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

export function LandingShell() {
  const t = useTranslations("Landing");
  const tc = useTranslations("Common");

  const navLinks = useMemo(
    () =>
      [
        { href: "/#uvod", id: "uvod", label: t("navHome") },
        { href: "/#funkcie", id: "funkcie", label: t("navFeatures") },
        { href: "/#pre-koho", id: "pre-koho", label: t("navAudience") },
        { href: "/#postup", id: "postup", label: t("navSteps") },
        { href: "/#faq", id: "faq", label: t("navFaq") },
        { href: "/#zacat", id: "zacat", label: t("navStart") },
      ] as const,
    [t],
  );

  const features = useMemo(
    () =>
      [
        {
          id: "invoices",
          title: t("featureInvoicesTitle"),
          body: t("featureInvoicesBody"),
          Icon: Receipt,
        },
        {
          id: "payments",
          title: t("featurePaymentsTitle"),
          body: t("featurePaymentsBody"),
          Icon: Banknote,
        },
        {
          id: "reminders",
          title: t("featureRemindersTitle"),
          body: t("featureRemindersBody"),
          Icon: Bell,
        },
        {
          id: "catalog",
          title: t("featureCatalogTitle"),
          body: t("featureCatalogBody"),
          Icon: Package,
        },
        {
          id: "reports",
          title: t("featureReportsTitle"),
          body: t("featureReportsBody"),
          Icon: FileSpreadsheet,
        },
        {
          id: "export",
          title: t("featureExportTitle"),
          body: t("featureExportBody"),
          Icon: Upload,
        },
      ] as const,
    [t],
  );

  const audiences = useMemo(
    () =>
      [
        {
          id: "szco",
          title: t("audienceSzcoTitle"),
          body: t("audienceSzcoBody"),
          Icon: UserRound,
        },
        {
          id: "freelance",
          title: t("audienceFreelanceTitle"),
          body: t("audienceFreelanceBody"),
          Icon: Laptop,
        },
        {
          id: "team",
          title: t("audienceTeamTitle"),
          body: t("audienceTeamBody"),
          Icon: Users,
        },
      ] as const,
    [t],
  );

  const steps = useMemo(
    () =>
      [
        {
          n: "01",
          title: t("step1Title"),
          body: t("step1Body"),
        },
        {
          n: "02",
          title: t("step2Title"),
          body: t("step2Body"),
        },
        {
          n: "03",
          title: t("step3Title"),
          body: t("step3Body"),
        },
      ] as const,
    [t],
  );

  const compareRows = useMemo(
    () =>
      [
        {
          id: "numbering",
          label: t("compareNumbering"),
          excel: t("compareNumberingExcel"),
          fakturio: t("compareNumberingApp"),
        },
        {
          id: "vat",
          label: t("compareVat"),
          excel: t("compareVatExcel"),
          fakturio: t("compareVatApp"),
        },
        {
          id: "match",
          label: t("compareMatch"),
          excel: t("compareMatchExcel"),
          fakturio: t("compareMatchApp"),
        },
        {
          id: "due",
          label: t("compareDue"),
          excel: t("compareDueExcel"),
          fakturio: t("compareDueApp"),
        },
        {
          id: "export",
          label: t("compareExport"),
          excel: t("compareExportExcel"),
          fakturio: t("compareExportApp"),
        },
      ] as const,
    [t],
  );

  const trustItems = useMemo(
    () =>
      [
        {
          id: "sk",
          title: t("trustSkTitle"),
          body: t("trustSkBody"),
          Icon: Briefcase,
        },
        {
          id: "data",
          title: t("trustDataTitle"),
          body: t("trustDataBody"),
          Icon: Shield,
        },
        {
          id: "free",
          title: t("trustFreeTitle"),
          body: t("trustFreeBody"),
          Icon: Check,
        },
      ] as const,
    [t],
  );

  const faqs = useMemo(
    () =>
      [
        { id: "faq1", q: t("faq1q"), a: t("faq1a") },
        { id: "faq2", q: t("faq2q"), a: t("faq2a") },
        { id: "faq3", q: t("faq3q"), a: t("faq3a") },
        { id: "faq4", q: t("faq4q"), a: t("faq4a") },
      ] as const,
    [t],
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const reduce = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(navLinks.map((l) => l.id));

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 12));
  }, [scrollY]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const onNavClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setMenuOpen(false);
  };

  return (
    <div className="landing">
      <Link href="/#uvod" className="landing-skip">
        {t("skip")}
      </Link>

      <motion.div
        className="landing-progress"
        style={{ scaleX: progress }}
        aria-hidden
      />

      <header className={`landing-top${scrolled ? " is-scrolled" : ""}`}>
        <Link href="/" className="landing-wordmark">
          <span className="landing-mark" aria-hidden>
            F
          </span>
          Fakturio
        </Link>

        <nav className="landing-pill-nav" aria-label={t("footProduct")}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active === link.id ? "page" : undefined}
              onClick={(e) => onNavClick(e, link.id)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="landing-top-right">
          <LocaleSwitcher compact className="landing-locale" />
          <LandingThemeToggle />
          <LandingNavActions />
          <button
            type="button"
            className="landing-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={menuOpen ? tc("closeMenu") : tc("openMenu")}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="landing-mobile-nav"
            className="landing-mobile-nav"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => onNavClick(e, link.id)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/sign-in" onClick={() => setMenuOpen(false)}>
              {t("signIn")}
            </Link>
            <Link
              href="/sign-up"
              className="landing-btn landing-btn-teal"
              onClick={() => setMenuOpen(false)}
            >
              {t("createAccount")}
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="landing-hero" id="uvod" aria-label={t("navHome")}>
        <ParallaxFloat className="landing-float landing-float-a">VS</ParallaxFloat>
        <ParallaxFloat className="landing-float landing-float-b">DPH</ParallaxFloat>
        <div className="landing-curve" aria-hidden />
        <div className="landing-grain" aria-hidden />

        <motion.div
          className="landing-hero-copy"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="landing-eyebrow"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
          >
            {t("eyebrow")}
          </motion.p>
          <h1>
            <span className="landing-hero-line">{t("heroTitle1")}</span>{" "}
            <span className="landing-hero-line landing-hero-line-accent">
              {t("heroTitle2")}
            </span>
          </h1>
          <p className="landing-hero-lead">{t("heroLead")}</p>
          <LandingHeroActions />
          <p className="landing-hero-trust">{t("heroTrust")}</p>
        </motion.div>
      </section>

      <section className="landing-bento" aria-label={t("previewOverview")}>
        <LandingPreview />
        <LandingCashflowCard />
      </section>

      <section
        className="landing-section"
        id="funkcie"
        aria-label={t("navFeatures")}
      >
        <LandingReveal className="landing-section-head">
          <h2>{t("featuresTitle")}</h2>
          <p>{t("featuresLead")}</p>
        </LandingReveal>
        <LandingStagger className="landing-features landing-features-6">
          {features.map((f) => (
            <LandingStaggerItem key={f.id}>
              <article className="landing-feature">
                <span className="landing-feature-icon" aria-hidden>
                  <f.Icon strokeWidth={1.75} className="size-5" />
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            </LandingStaggerItem>
          ))}
        </LandingStagger>
      </section>

      <section
        className="landing-section"
        id="pre-koho"
        aria-label={t("navAudience")}
      >
        <LandingReveal className="landing-section-head">
          <h2>{t("audienceTitle")}</h2>
          <p>{t("audienceLead")}</p>
        </LandingReveal>
        <LandingStagger className="landing-audience">
          {audiences.map((a) => (
            <LandingStaggerItem key={a.id}>
              <article className="landing-audience-card">
                <span className="landing-audience-icon" aria-hidden>
                  <a.Icon strokeWidth={1.75} className="size-5" />
                </span>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </article>
            </LandingStaggerItem>
          ))}
        </LandingStagger>
      </section>

      <section className="landing-section" id="postup" aria-label={t("navSteps")}>
        <LandingReveal className="landing-section-head">
          <h2>{t("stepsTitle")}</h2>
          <p>{t("stepsLead")}</p>
        </LandingReveal>
        <LandingStagger className="landing-steps">
          {steps.map((s, i) => (
            <LandingStaggerItem key={s.n}>
              <article className="landing-step">
                <span className="landing-step-n">{s.n}</span>
                {i < steps.length - 1 ? (
                  <span className="landing-step-rail" aria-hidden />
                ) : null}
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            </LandingStaggerItem>
          ))}
        </LandingStagger>
      </section>

      <section
        className="landing-section"
        id="porovnanie"
        aria-label={t("compareTitle")}
      >
        <LandingReveal className="landing-section-head landing-section-head-wide">
          <h2>{t("compareTitle")}</h2>
          <p>{t("compareLead")}</p>
        </LandingReveal>
        <LandingReveal>
          <div
            className="landing-compare"
            role="table"
            aria-label={t("footCompare")}
          >
            <div className="landing-compare-head" role="row">
              <span role="columnheader">{t("compareWhat")}</span>
              <span role="columnheader">{t("compareExcel")}</span>
              <span role="columnheader">{t("compareFakturio")}</span>
            </div>
            {compareRows.map((row) => (
              <div className="landing-compare-row" role="row" key={row.id}>
                <span role="cell">{row.label}</span>
                <span role="cell" className="is-muted">
                  {row.excel}
                </span>
                <span role="cell" className="is-good">
                  <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                  {row.fakturio}
                </span>
              </div>
            ))}
          </div>
        </LandingReveal>
      </section>

      <section
        className="landing-section"
        id="ukazka"
        aria-label={t("footSample")}
      >
        <div className="landing-sample">
          <LandingReveal className="landing-sample-copy">
            <p className="landing-eyebrow">{t("sampleEyebrow")}</p>
            <h2>{t("sampleTitle")}</h2>
            <p>{t("sampleLead")}</p>
            <ul className="landing-sample-points">
              <li>{t("samplePoint1")}</li>
              <li>{t("samplePoint2")}</li>
              <li>{t("samplePoint3")}</li>
            </ul>
          </LandingReveal>
          <LandingReveal delay={0.1}>
            <article className="landing-invoice" aria-label={t("footSample")}>
              <header className="landing-invoice-top">
                <div>
                  <strong>{t("invoiceLabel")}</strong>
                  <span>2026-016</span>
                </div>
                <div className="landing-invoice-stamp">{t("invoiceStatus")}</div>
              </header>
              <div className="landing-invoice-parties">
                <div>
                  <span>{t("invoiceSupplier")}</span>
                  <p>Peter Dinis · SZČO</p>
                  <p>IČO 12 345 678</p>
                </div>
                <div>
                  <span>{t("invoiceCustomer")}</span>
                  <p>Studio Nova s.r.o.</p>
                  <p>Bratislava</p>
                </div>
              </div>
              <div className="landing-invoice-lines">
                <div>
                  <span>UX konzultácia</span>
                  <strong>420,00 €</strong>
                </div>
                <div>
                  <span>Doprava / režijné</span>
                  <strong>35,00 €</strong>
                </div>
              </div>
              <footer className="landing-invoice-foot">
                <div>
                  <span>VS</span>
                  <strong>2026016</strong>
                </div>
                <div>
                  <span>{t("invoiceDue")}</span>
                  <strong>14. 11. 2026</strong>
                </div>
                <div>
                  <span>{t("invoiceTotal")}</span>
                  <strong>455,00 €</strong>
                </div>
              </footer>
            </article>
          </LandingReveal>
        </div>
      </section>

      <section
        className="landing-section landing-trust-section"
        aria-label={t("trustSkTitle")}
      >
        <LandingStagger className="landing-trust">
          {trustItems.map((item) => (
            <LandingStaggerItem key={item.id}>
              <article className="landing-trust-item">
                <span className="landing-trust-icon" aria-hidden>
                  <item.Icon strokeWidth={1.75} className="size-4" />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            </LandingStaggerItem>
          ))}
        </LandingStagger>
      </section>

      <section className="landing-section" id="faq" aria-label={t("navFaq")}>
        <LandingReveal className="landing-section-head">
          <h2>{t("faqTitle")}</h2>
          <p>{t("faqLead")}</p>
        </LandingReveal>
        <div className="landing-faq">
          {faqs.map((item, i) => {
            const open = faqOpen === i;
            return (
              <LandingReveal key={item.id} delay={i * 0.04}>
                <div className={`landing-faq-item${open ? " is-open" : ""}`}>
                  <button
                    type="button"
                    className="landing-faq-q"
                    aria-expanded={open}
                    onClick={() => setFaqOpen(open ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <motion.span
                      className="landing-faq-icon"
                      aria-hidden
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        className="landing-faq-a"
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p>{item.a}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </LandingReveal>
            );
          })}
        </div>
      </section>

      <LandingReveal>
        <section className="landing-cta" id="zacat" aria-label={t("navStart")}>
          <div className="landing-cta-glow" aria-hidden />
          <p>{t("ctaTitle")}</p>
          <p className="landing-cta-note">{t("ctaNote")}</p>
          <LandingCtaActions />
        </section>
      </LandingReveal>

      <footer className="landing-foot">
        <div className="landing-foot-brand">
          <span className="landing-mark" aria-hidden>
            F
          </span>
          <div>
            <strong>Fakturio</strong>
            <p>{t("footTagline")}</p>
          </div>
        </div>
        <div className="landing-foot-cols">
          <div>
            <span>{t("footProduct")}</span>
            <Link href="/#funkcie" onClick={(e) => onNavClick(e, "funkcie")}>
              {t("footFeatures")}
            </Link>
            <Link
              href="/#porovnanie"
              onClick={(e) => onNavClick(e, "porovnanie")}
            >
              {t("footCompare")}
            </Link>
            <Link href="/#ukazka" onClick={(e) => onNavClick(e, "ukazka")}>
              {t("footSample")}
            </Link>
          </div>
          <div>
            <span>{t("footAccount")}</span>
            <Link href="/sign-in">{t("footSignIn")}</Link>
            <Link href="/sign-up">{t("footSignUp")}</Link>
            <Link href="/#faq" onClick={(e) => onNavClick(e, "faq")}>
              {t("navFaq")}
            </Link>
          </div>
        </div>
        <p className="landing-foot-copy">
          © {new Date().getFullYear()} Fakturio
        </p>
      </footer>
    </div>
  );
}
