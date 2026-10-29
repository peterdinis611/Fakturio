"use client";

import { useTheme } from "@teispace/next-themes";
import { motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("Common");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-raised hover:text-ink",
        className,
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("themeEnableLight") : t("themeEnableDark")}
    >
      <span className="relative size-4 shrink-0">
        {mounted ? (
          <motion.span
            key={isDark ? "moon" : "sun"}
            className="absolute inset-0 flex items-center justify-center"
            initial={reduce ? false : { opacity: 0, rotate: -45, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {isDark ? (
              <Moon className="size-4" strokeWidth={1.5} />
            ) : (
              <Sun className="size-4" strokeWidth={1.5} />
            )}
          </motion.span>
        ) : null}
      </span>
      <span>{isDark ? t("themeDark") : t("themeLight")}</span>
    </button>
  );
}
