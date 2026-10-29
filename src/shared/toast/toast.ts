import { dismissToast, pushToast } from "./store";
import type { ToastInput, ToastOptions, ToastVariant } from "./types";

let seq = 0;

function nextId() {
  seq += 1;
  return `toast_${Date.now().toString(36)}_${seq}`;
}

function normalize(
  input: ToastInput,
  variant: ToastVariant,
  defaults?: ToastOptions,
): {
  id: string;
  title: string;
  description?: string;
  duration: number;
  dismissible: boolean;
  variant: ToastVariant;
} {
  const base = typeof input === "string" ? { title: input } : input;
  const duration =
    base.duration ??
    defaults?.duration ??
    (variant === "error" ? 5600 : 3800);

  return {
    id: base.id ?? defaults?.id ?? nextId(),
    title: base.title,
    description: base.description ?? defaults?.description,
    duration,
    dismissible: base.dismissible ?? defaults?.dismissible ?? true,
    variant,
  };
}

function show(
  input: ToastInput,
  variant: ToastVariant,
  options?: ToastOptions,
) {
  const data = normalize(input, variant, options);
  return pushToast({
    ...data,
    createdAt: Date.now(),
  });
}

export const toast = {
  show(input: ToastInput, options?: ToastOptions) {
    return show(input, "default", options);
  },
  message(title: string, options?: ToastOptions) {
    return show({ title, ...options }, "default", options);
  },
  success(title: string, options?: ToastOptions) {
    return show({ title, ...options }, "success", options);
  },
  error(title: string, options?: ToastOptions) {
    return show({ title, ...options }, "error", options);
  },
  warning(title: string, options?: ToastOptions) {
    return show({ title, ...options }, "warning", options);
  },
  dismiss(id?: string) {
    if (id) dismissToast(id);
  },
};

export type { ToastOptions, ToastVariant };
