"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** Scroll window to top on client navigations. */
export function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/** Floating control after the user scrolls down. */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Nahor"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed right-4 bottom-4 z-50 inline-flex size-11 items-center justify-center rounded-[4px]",
        "border border-ink/20 bg-ink text-ground shadow-[0_8px_24px_rgba(0,0,0,0.28)]",
        "transition-all duration-200 hover:bg-ink/90 hover:shadow-[0_10px_28px_rgba(0,0,0,0.34)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-ground",
        "md:right-6 md:bottom-6",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp className="size-5" strokeWidth={2.25} aria-hidden />
    </button>
  );
}
