import { driver, type DriveStep, type Driver } from "driver.js";
import { PRODUCT_TOUR_STEPS } from "./steps";
import { markProductTourDone, saveTourResumeStep } from "./storage";

export type TourCopy = {
  next: string;
  prev: string;
  done: string;
  progress: string;
  stepTitle: (key: string) => string;
  stepBody: (key: string) => string;
};

type CreateTourOptions = {
  userId: string;
  pathname: string;
  navigate: (href: string) => void;
  copy: TourCopy;
  /** Called when the tour tears down because of a route hand-off (not a real exit). */
  onNavigating?: () => void;
};

/**
 * Build a Driver.js instance for the full-app tour.
 * Cross-route steps persist the next index and navigate; the provider resumes.
 */
export function createProductTour({
  userId,
  pathname,
  navigate,
  copy,
  onNavigating,
}: CreateTourOptions): Driver {
  let handoff = false;

  const steps: DriveStep[] = PRODUCT_TOUR_STEPS.map((def) => ({
    element: def.element,
    waitForElement: 6000,
    skipMissingElement: true,
    disableActiveInteraction: true,
    popover: {
      title: copy.stepTitle(def.titleKey),
      description: copy.stepBody(def.bodyKey),
      side: def.side ?? "right",
      align: "start",
    },
    data: { route: def.route, id: def.id },
  }));

  const tour = driver({
    steps,
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayOpacity: 0.55,
    stagePadding: 8,
    stageRadius: 4,
    popoverClass: "fakturio-tour-popover",
    showProgress: true,
    progressText: copy.progress,
    nextBtnText: copy.next,
    prevBtnText: copy.prev,
    doneBtnText: copy.done,
    onNextClick: (_el, _step, { driver: d, index }) => {
      const i = index ?? 0;
      const nextIndex = i + 1;
      if (nextIndex >= PRODUCT_TOUR_STEPS.length) {
        d.destroy();
        return;
      }
      const next = PRODUCT_TOUR_STEPS[nextIndex];
      if (next.route !== pathname) {
        handoff = true;
        saveTourResumeStep(nextIndex);
        onNavigating?.();
        d.destroy();
        navigate(next.route);
        return;
      }
      d.moveNext();
    },
    onPrevClick: (_el, _step, { driver: d, index }) => {
      const i = index ?? 0;
      if (i <= 0) return;
      const prevIndex = i - 1;
      const prev = PRODUCT_TOUR_STEPS[prevIndex];
      if (prev.route !== pathname) {
        handoff = true;
        saveTourResumeStep(prevIndex);
        onNavigating?.();
        d.destroy();
        navigate(prev.route);
        return;
      }
      d.movePrevious();
    },
    onDestroyed: (_el, _step, { reason }) => {
      if (handoff) return;
      // Mark complete on finish / close / escape — user can restart from Settings.
      if (reason === "done" || reason === "close" || reason === "escape" || reason === "overlay") {
        markProductTourDone(userId);
      }
    },
  });

  return tour;
}
