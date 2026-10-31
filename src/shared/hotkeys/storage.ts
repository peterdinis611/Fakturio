import type { CustomHotkeys } from "@tanstack/react-hotkeys";

const PREFIX = "fakturio.hotkeys.v1.";

export function hotkeysStorageKey(userId: string) {
  return `${PREFIX}${userId}`;
}

export function loadCustomHotkeys(userId: string): CustomHotkeys {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(hotkeysStorageKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as CustomHotkeys;
  } catch {
    return {};
  }
}

export function saveCustomHotkeys(userId: string, custom: CustomHotkeys) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(hotkeysStorageKey(userId), JSON.stringify(custom));
  } catch {
    // Quota / private mode — ignore; shortcuts still work for the session.
  }
}
