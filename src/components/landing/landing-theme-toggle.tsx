"use client";

import { useTheme } from "@teispace/next-themes";
import { motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function LandingThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="landing-theme-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Zapnúť svetlý režim" : "Zapnúť tmavý režim"}
      title={isDark ? "Svetlý režim" : "Tmavý režim"}
    >
      {mounted ? (
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={reduce ? false : { opacity: 0, rotate: -40, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="landing-theme-toggle-icon"
        >
          {isDark ? (
            <Moon className="size-4" strokeWidth={1.75} />
          ) : (
            <Sun className="size-4" strokeWidth={1.75} />
          )}
        </motion.span>
      ) : (
        <span className="landing-theme-toggle-icon" aria-hidden />
      )}
    </button>
  );
}
