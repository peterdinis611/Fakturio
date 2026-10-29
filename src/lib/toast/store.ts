import type { ToastRecord } from "./types";

const MAX_VISIBLE = 4;

type Listener = () => void;

let toasts: ToastRecord[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener();
}

function scheduleDismiss(id: string, duration: number) {
  if (duration <= 0) return;
  const existing = timers.get(id);
  if (existing) clearTimeout(existing);
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id);
      dismissToast(id);
    }, duration),
  );
}

export function getToasts(): ToastRecord[] {
  return toasts;
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushToast(toast: ToastRecord): string {
  toasts = [toast, ...toasts.filter((t) => t.id !== toast.id)].slice(
    0,
    MAX_VISIBLE,
  );
  scheduleDismiss(toast.id, toast.duration);
  emit();
  return toast.id;
}

export function dismissToast(id: string): void {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  const next = toasts.filter((t) => t.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}

export function clearToasts(): void {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  if (toasts.length === 0) return;
  toasts = [];
  emit();
}
