"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import type { Driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./product-tour.css";
import { usePathname, useRouter } from "@/i18n/navigation";
import { createProductTour } from "./create-tour";
import { PRODUCT_TOUR_STEPS } from "./steps";
import {
  PRODUCT_TOUR_START_EVENT,
  clearProductTourDone,
  isProductTourDone,
  saveTourResumeStep,
  takeTourResumeStep,
} from "./storage";

type Props = {
  userId: string;
};

/**
 * Resumes multi-page Driver.js tour after navigation and auto-starts once
 * on the first dashboard visit (desktop sidebar required for nav anchors).
 */
export function ProductTourProvider({ userId }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("ProductTour");
  const tourRef = useRef<Driver | null>(null);
  const autoStarted = useRef(false);
  const handoffRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let startTimer: ReturnType<typeof setTimeout> | undefined;

    const destroyTour = () => {
      tourRef.current?.destroy();
      tourRef.current = null;
    };

    const resolvedCopy = {
      next: t("next"),
      prev: t("prev"),
      done: t("done"),
      // Driver.js owns `{{current}}` / `{{total}}` — do not run through next-intl ICU.
      progress: "{{current}} / {{total}}",
      stepTitle: (key: string) => t(`steps.${key}` as "steps.welcomeTitle"),
      stepBody: (key: string) => t(`steps.${key}` as "steps.welcomeBody"),
    };

    const startAt = (index: number) => {
      if (cancelled) return;
      destroyTour();
      const tour = createProductTour({
        userId,
        pathname,
        navigate: (href) => {
          handoffRef.current = true;
          router.push(href);
        },
        copy: resolvedCopy,
        onNavigating: () => {
          handoffRef.current = true;
        },
      });
      tourRef.current = tour;
      tour.drive(index);
    };

    const resume = takeTourResumeStep();
    if (resume !== null) {
      const step = PRODUCT_TOUR_STEPS[resume];
      if (!step) {
        /* invalid */
      } else if (step.route === pathname) {
        startTimer = setTimeout(() => startAt(resume), 320);
      } else {
        saveTourResumeStep(resume);
        router.push(step.route);
      }
    } else if (
      !autoStarted.current &&
      !isProductTourDone(userId) &&
      pathname === "/dashboard" &&
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches
    ) {
      autoStarted.current = true;
      startTimer = setTimeout(() => startAt(0), 750);
    }

    const onManualStart = () => {
      clearProductTourDone(userId);
      autoStarted.current = true;
      const first = PRODUCT_TOUR_STEPS[0];
      if (pathname !== first.route) {
        handoffRef.current = true;
        saveTourResumeStep(0);
        router.push(first.route);
        return;
      }
      startAt(0);
    };

    window.addEventListener(PRODUCT_TOUR_START_EVENT, onManualStart);

    return () => {
      cancelled = true;
      if (startTimer) clearTimeout(startTimer);
      window.removeEventListener(PRODUCT_TOUR_START_EVENT, onManualStart);
      if (handoffRef.current) {
        handoffRef.current = false;
        return;
      }
      destroyTour();
    };
  }, [pathname, router, t, userId]);

  return null;
}
