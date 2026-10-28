"use client";

import Link from "next/link";
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
import { useEffect, useState, type MouseEvent } from "react";
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

const navLinks = [
  { href: "/#uvod", id: "uvod", label: "Domov" },
  { href: "/#funkcie", id: "funkcie", label: "Funkcie" },
  { href: "/#pre-koho", id: "pre-koho", label: "Pre koho" },
  { href: "/#postup", id: "postup", label: "Postup" },
  { href: "/#faq", id: "faq", label: "FAQ" },
  { href: "/#zacat", id: "zacat", label: "Začať" },
] as const;

const audiences = [
  {
    title: "SZČO",
    body: "Neplatca DPH, EUR, IČO a IBAN. Faktúra bez tabuľky a Word šablóny.",
    Icon: UserRound,
  },
  {
    title: "Freelancer",
    body: "Opakovaní klienti, katalóg služieb a prehľad, kto ešte nezaplatil.",
    Icon: Laptop,
  },
  {
    title: "Malý tím",
    body: "Jedna firma, spoločný prehľad splatností a export pre účtovníka.",
    Icon: Users,
  },
] as const;

const compareRows = [
  { label: "Číslovanie & VS", excel: "Ručne / skript", fakturio: "Automaticky" },
  { label: "DPH režimy", excel: "Vlastné vzorce", fakturio: "Neplatca / platca" },
  { label: "Párovanie platieb", excel: "Hľadanie vo VS", fakturio: "Import CSV" },
  { label: "Splatnosti", excel: "Farbičky v bunkách", fakturio: "Prehľad + joby" },
  { label: "Export účtovníkovi", excel: "Copy-paste", fakturio: "CSV / PDF" },
] as const;

const trustItems = [
  {
    title: "SK prax",
    body: "IČO, DIČ, IBAN, VS a EUR — bez úprav pre zahraničné šablóny.",
    Icon: Briefcase,
  },
  {
    title: "Tvoje dáta",
    body: "Firemné záznamy ostávajú v tvojej inštancii, účet je oddelený.",
    Icon: Shield,
  },
  {
    title: "Bez kreditky",
    body: "Začni zadarmo. Nastavenie firmy a prvá faktúra za pár minút.",
    Icon: Check,
  },
] as const;

const features = [
  {
    title: "Faktúry & DPH",
    body: "Položky, sadzby a režim neplatcu — čísla a VS pripravené na odoslanie.",
    Icon: Receipt,
  },
  {
    title: "Platby podľa VS",
    body: "Import bankového CSV a párovanie podľa variabilného symbolu.",
    Icon: Banknote,
  },
  {
    title: "Splatnosti & upomienky",
    body: "Prehľad po splatnosti a joby, ktoré ťa nenechajú zabudnúť.",
    Icon: Bell,
  },
  {
    title: "Katalóg služieb",
    body: "Opakované položky s cenou a DPH — na faktúru jedným klikom.",
    Icon: Package,
  },
  {
    title: "Reporty & cashflow",
    body: "Mesačné tržby, aging a prehľad bez tabuľkového chaosu.",
    Icon: FileSpreadsheet,
  },
  {
    title: "Export pre účtovníka",
    body: "CSV / PDF pripravené na odovzdanie — bez ručného prepisovania.",
    Icon: Upload,
  },
] as const;

const steps = [
  {
    n: "01",
    title: "Firma",
    body: "IČO, IBAN a DPH raz — potom idú do každej faktúry.",
  },
  {
    n: "02",
    title: "Zákazník",
    body: "Odberateľ s adresou a kontaktom. Ďalšia faktúra je rýchlejšia.",
  },
  {
    n: "03",
    title: "Faktúra",
    body: "Koncept → vystavená → splatnosť → zaplatená. VS páruje platby.",
  },
] as const;

const faqs = [
  {
    q: "Je Fakturio vhodné pre SZČO?",
    a: "Áno — režim neplatcu DPH, EUR, slovenské údaje a platobný pás sú pripravené na bežnú prax.",
  },
  {
    q: "Ako funguje párovanie platieb?",
    a: "Nahraješ bankový CSV. Podľa VS nájdeme vystavené faktúry a označíme ich ako zaplatené.",
  },
  {
    q: "Kde sú moje dáta?",
    a: "V tvojej inštancii. Prihlásenie rieši bezpečný účet; firemné dáta ostávajú u teba.",
  },
  {
    q: "Koľko to stojí?",
    a: "Teraz môžeš začať zadarmo. Cenník produktových plánov doplníme neskôr — bez skrytých limitov na skúšku.",
  },
] as const;

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
        Preskočiť na obsah
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

        <nav className="landing-pill-nav" aria-label="Sekcie">
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
          <LandingThemeToggle />
          <LandingNavActions />
          <button
            type="button"
            className="landing-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={menuOpen ? "Zavrieť menu" : "Otvoriť menu"}
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
              Prihlásiť sa
            </Link>
            <Link
              href="/sign-up"
              className="landing-btn landing-btn-teal"
              onClick={() => setMenuOpen(false)}
            >
              Vytvoriť účet
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="landing-hero" id="uvod" aria-label="Úvod">
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
            Faktúry · DPH · platby
          </motion.p>
          <h1>
            <span className="landing-hero-line">Fakturácia</span>{" "}
            <span className="landing-hero-line landing-hero-line-accent">
              bez balastu
            </span>
          </h1>
          <p className="landing-hero-lead">
            Pre freelancera a SZČO — vystavuj, sleduj splatnosti a maj cashflow
            pod kontrolou.
          </p>
          <LandingHeroActions />
          <p className="landing-hero-trust">
            Bez kreditky · nastavenie firmy za pár minút
          </p>
        </motion.div>
      </section>

      <section className="landing-bento" aria-label="Náhľad produktu">
        <LandingPreview />
        <LandingCashflowCard />
      </section>

      <section className="landing-section" id="funkcie" aria-label="Funkcie">
        <LandingReveal className="landing-section-head">
          <h2>Všetko, čo potrebuješ na faktúru</h2>
          <p>
            Od konceptu po pečiatku — bez prepínania medzi piatimi nástrojmi.
          </p>
        </LandingReveal>
        <LandingStagger className="landing-features landing-features-6">
          {features.map((f) => (
            <LandingStaggerItem key={f.title}>
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

      <section className="landing-section" id="pre-koho" aria-label="Pre koho">
        <LandingReveal className="landing-section-head">
          <h2>Pre koho je Fakturio</h2>
          <p>Nie ERP. Nástroj na faktúry, splatnosti a cashflow — v slovenskej praxi.</p>
        </LandingReveal>
        <LandingStagger className="landing-audience">
          {audiences.map((a) => (
            <LandingStaggerItem key={a.title}>
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

      <section className="landing-section" id="postup" aria-label="Postup">
        <LandingReveal className="landing-section-head">
          <h2>Tri kroky a môžeš fakturovať</h2>
          <p>Onboarding trvá minúty. Ďalšia faktúra ešte menej.</p>
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
        aria-label="Porovnanie s Excelom"
      >
        <LandingReveal className="landing-section-head landing-section-head-wide">
          <h2>Namiesto Excelu a Word šablón</h2>
          <p>
            Tabuľka zvládne všetko — kým nezabudneš VS, sadzbu alebo kto ešte
            dlží.
          </p>
        </LandingReveal>
        <LandingReveal>
          <div className="landing-compare" role="table" aria-label="Porovnanie">
            <div className="landing-compare-head" role="row">
              <span role="columnheader">Čo riešiš</span>
              <span role="columnheader">Excel</span>
              <span role="columnheader">Fakturio</span>
            </div>
            {compareRows.map((row) => (
              <div className="landing-compare-row" role="row" key={row.label}>
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

      <section className="landing-section" id="ukazka" aria-label="Ukážka faktúry">
        <div className="landing-sample">
          <LandingReveal className="landing-sample-copy">
            <p className="landing-eyebrow">Ukážka</p>
            <h2>Faktúra, ktorú pozná klient aj banka</h2>
            <p>
              Číslo, VS, splatnosť a platobný pás — pripravené na odoslanie.
              Bez ručného kopírovania do PDF šablóny.
            </p>
            <ul className="landing-sample-points">
              <li>Režim neplatcu DPH</li>
              <li>VS zhodný s číslom faktúry</li>
              <li>IBAN a QR pripravené na doplnenie</li>
            </ul>
          </LandingReveal>
          <LandingReveal delay={0.1}>
            <article className="landing-invoice" aria-label="Náhľad faktúry">
              <header className="landing-invoice-top">
                <div>
                  <strong>FAKTÚRA</strong>
                  <span>2026-016</span>
                </div>
                <div className="landing-invoice-stamp">Vystavená</div>
              </header>
              <div className="landing-invoice-parties">
                <div>
                  <span>Dodávateľ</span>
                  <p>Peter Dinis · SZČO</p>
                  <p>IČO 12 345 678</p>
                </div>
                <div>
                  <span>Odberateľ</span>
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
                  <span>Splatnosť</span>
                  <strong>14. 11. 2026</strong>
                </div>
                <div>
                  <span>Celkom</span>
                  <strong>455,00 €</strong>
                </div>
              </footer>
            </article>
          </LandingReveal>
        </div>
      </section>

      <section className="landing-section landing-trust-section" aria-label="Dôvera">
        <LandingStagger className="landing-trust">
          {trustItems.map((t) => (
            <LandingStaggerItem key={t.title}>
              <article className="landing-trust-item">
                <span className="landing-trust-icon" aria-hidden>
                  <t.Icon strokeWidth={1.75} className="size-4" />
                </span>
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                </div>
              </article>
            </LandingStaggerItem>
          ))}
        </LandingStagger>
      </section>

      <section className="landing-section" id="faq" aria-label="FAQ">
        <LandingReveal className="landing-section-head">
          <h2>Časté otázky</h2>
          <p>Krátko a na vec — bez marketingového balastu.</p>
        </LandingReveal>
        <div className="landing-faq">
          {faqs.map((item, i) => {
            const open = faqOpen === i;
            return (
              <LandingReveal key={item.q} delay={i * 0.04}>
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
        <section className="landing-cta" id="zacat" aria-label="Začať">
          <div className="landing-cta-glow" aria-hidden />
          <p>Vystav prvú faktúru ešte dnes</p>
          <p className="landing-cta-note">
            Rýchla registrácia · potom nastavenie firmy
          </p>
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
            <p>Fakturácia pre SK freelancerov a SZČO</p>
          </div>
        </div>
        <div className="landing-foot-cols">
          <div>
            <span>Produkt</span>
            <Link href="/#funkcie" onClick={(e) => onNavClick(e, "funkcie")}>
              Funkcie
            </Link>
            <Link href="/#porovnanie" onClick={(e) => onNavClick(e, "porovnanie")}>
              Porovnanie
            </Link>
            <Link href="/#ukazka" onClick={(e) => onNavClick(e, "ukazka")}>
              Ukážka
            </Link>
          </div>
          <div>
            <span>Účet</span>
            <Link href="/sign-in">Prihlásenie</Link>
            <Link href="/sign-up">Registrácia</Link>
            <Link href="/#faq" onClick={(e) => onNavClick(e, "faq")}>
              FAQ
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
