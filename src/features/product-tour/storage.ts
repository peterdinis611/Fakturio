const DONE_PREFIX = "fakturio_product_tour_done:";
const RESUME_KEY = "fakturio_product_tour_resume";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function isProductTourDone(userId: string): boolean {
  if (!canUseStorage()) return true;
  try {
    return localStorage.getItem(`${DONE_PREFIX}${userId}`) === "1";
  } catch {
    return true;
  }
}

export function markProductTourDone(userId: string) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(`${DONE_PREFIX}${userId}`, "1");
  } catch {
    /* ignore quota */
  }
}

export function clearProductTourDone(userId: string) {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(`${DONE_PREFIX}${userId}`);
  } catch {
    /* ignore */
  }
}

export function saveTourResumeStep(index: number) {
  if (!canUseStorage()) return;
  try {
    sessionStorage.setItem(RESUME_KEY, String(index));
  } catch {
    /* ignore */
  }
}

export function takeTourResumeStep(): number | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(RESUME_KEY);
    if (raw === null) return null;
    sessionStorage.removeItem(RESUME_KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch {
    return null;
  }
}

export const PRODUCT_TOUR_START_EVENT = "fakturio:product-tour-start";

export function requestProductTourStart() {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(PRODUCT_TOUR_START_EVENT));
}
