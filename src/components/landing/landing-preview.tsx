"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

function formatKpi(
  value: number,
  locale: string,
  decimals?: number,
  suffix?: string,
) {
  const tag = locale === "en" ? "en-US" : "sk-SK";
  const n =
    decimals != null
      ? value.toLocaleString(tag, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(value).toLocaleString(tag);
  return `${n}${suffix ?? ""}`;
}

function useCountUp(target: number, active: boolean, decimals = 0) {
  const [v, setV] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, reduce]);

  return decimals ? Number(v.toFixed(decimals)) : v;
}

function KpiCard({
  value,
  suffix,
  label,
  ring,
  decimals,
  active,
  locale,
}: {
  value: number;
  suffix?: string;
  label: string;
  ring: number;
  decimals?: number;
  active: boolean;
  locale: string;
}) {
  const n = useCountUp(value, active, decimals ?? 0);
  const deg = ring * 360;

  return (
    <div className="landing-kpi">
      <strong>{formatKpi(n, locale, decimals, suffix)}</strong>
      <span>{label}</span>
      <div
        className="landing-kpi-ring"
        style={{
          background: `conic-gradient(var(--lp-teal) ${deg}deg, var(--lp-raised) 0)`,
        }}
        aria-hidden
      />
    </div>
  );
}

export function LandingPreview() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const [tab, setTab] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const pauseTimer = useRef<number | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(mx, { stiffness: 180, damping: 22 });
  const ry = useSpring(my, { stiffness: 180, damping: 22 });
  const transform = useMotionTemplate`perspective(900px) rotateX(${ry}deg) rotateY(${rx}deg)`;

  const tabs = useMemo(
    () => [
      {
        id: "overview",
        label: t("previewOverview"),
        kpis: [
          { value: 24, suffix: "", label: t("previewIssued"), ring: 0.72 },
          { value: 7, suffix: "", label: t("previewOverdue"), ring: 0.28 },
          {
            value: 12.8,
            suffix: "k",
            label: t("previewMonth"),
            ring: 0.86,
            decimals: 1,
          },
        ],
      },
      {
        id: "invoices",
        label: t("previewInvoices"),
        rows: [
          {
            code: "2026-014",
            client: "Studio Nova",
            amount: "420 €",
            status: t("stampPaid"),
            tone: "ok" as const,
          },
          {
            code: "2026-015",
            client: "Mlyn s.r.o.",
            amount: "1 180 €",
            status: t("invoiceDue"),
            tone: "warn" as const,
          },
          {
            code: "2026-016",
            client: "Petra K.",
            amount: "95 €",
            status: "Draft",
            tone: "muted" as const,
          },
        ],
      },
      {
        id: "payments",
        label: t("previewPayments"),
        rows: [
          {
            code: "VS 26014",
            client: "Import CSV",
            amount: "420 €",
            status: t("stampPaid"),
            tone: "ok" as const,
          },
          {
            code: "VS 26011",
            client: "Import CSV",
            amount: "860 €",
            status: t("stampPaid"),
            tone: "ok" as const,
          },
          {
            code: "VS —",
            client: "—",
            amount: "50 €",
            status: "…",
            tone: "warn" as const,
          },
        ],
      },
    ],
    [t],
  );

  const selectTab = (i: number) => {
    setTab(i);
    setPaused(true);
    if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
    pauseTimer.current = window.setTimeout(() => setPaused(false), 8000);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setInView(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
    };
  }, []);

  useEffect(() => {
    if (reduce || !inView || paused) return;
    const id = window.setInterval(() => {
      setTab((v) => (v + 1) % tabs.length);
    }, 4200);
    return () => clearInterval(id);
  }, [reduce, inView, paused, tabs.length]);

  const current = tabs[tab]!;

  return (
    <motion.div
      ref={ref}
      className="landing-preview"
      data-ui
      style={reduce ? undefined : { transform }}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        mx.set(px * 6);
        my.set(py * -5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      initial={reduce ? false : { opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="landing-preview-side" aria-hidden>
        <span />
        <span className={tab === 0 ? "is-lit" : undefined} />
        <span className={tab === 1 ? "is-lit" : undefined} />
        <span className={tab === 2 ? "is-lit" : undefined} />
      </div>
      <div className="landing-preview-main">
        <div
          className="landing-preview-tabs"
          role="tablist"
          aria-label={t("previewOverview")}
        >
          {tabs.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === i}
              className={tab === i ? "is-on" : undefined}
              onClick={() => selectTab(i)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {"kpis" in current ? (
            <motion.div
              key={current.id}
              className="landing-kpi-row"
              role="tabpanel"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {current.kpis?.map((k) => (
                <KpiCard
                  key={k.label}
                  {...k}
                  locale={locale}
                  active={inView && tab === 0}
                />
              ))}
            </motion.div>
          ) : (
            <motion.ul
              key={current.id}
              className="landing-preview-list"
              role="tabpanel"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {current.rows.map((row) => (
                <li key={row.code + row.client}>
                  <span className="landing-preview-code">{row.code}</span>
                  <span className="landing-preview-client">{row.client}</span>
                  <span className="landing-preview-amt">{row.amount}</span>
                  <span
                    className={`landing-preview-status status-${row.tone}`}
                  >
                    {row.status}
                  </span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <motion.span
        className="landing-stamp-chip"
        initial={reduce ? false : { opacity: 0, rotate: 18, scale: 0.8 }}
        whileInView={{ opacity: 1, rotate: 8, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {t("stampPaid")}
      </motion.span>
    </motion.div>
  );
}

export function LandingCashflowCard() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [drawn, setDrawn] = useState(false);
  const amount = useCountUp(1280, drawn);
  const tag = locale === "en" ? "en-US" : "sk-SK";

  return (
    <motion.aside
      className="landing-stat"
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onViewportEnter={() => setDrawn(true)}
      whileHover={reduce ? undefined : { y: -6, transition: { duration: 0.25 } }}
    >
      <div className="landing-stat-label">
        <span>{t("cashflowLabel")}</span>
        <span className="landing-stat-dot" aria-hidden>
          €
        </span>
      </div>
      <strong>{Math.round(amount).toLocaleString(tag)} €</strong>
      <svg
        className="landing-stat-svg"
        viewBox="0 0 200 56"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="cfFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--lp-teal)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--lp-teal)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 42 C28 40 36 28 58 30 C80 32 88 18 110 16 C132 14 148 26 170 12 C186 4 194 8 200 6 L200 56 L0 56 Z"
          fill="url(#cfFill)"
          initial={reduce ? false : { opacity: 0 }}
          animate={drawn ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        />
        <motion.path
          d="M0 42 C28 40 36 28 58 30 C80 32 88 18 110 16 C132 14 148 26 170 12 C186 4 194 8 200 6"
          fill="none"
          stroke="var(--lp-teal)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={drawn ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <p className="landing-stat-hint">{t("cashflowHint")}</p>
    </motion.aside>
  );
}
