"use client";

import { createElement, type ReactNode } from "react";
import { sileo } from "sileo";
import {
  AlertCircle,
  Check,
  Info,
  TriangleAlert,
} from "@/shared/icons";
import type {
  ToastInput,
  ToastOptions,
  ToastPromiseMessages,
  ToastVariant,
} from "./types";

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  default: 4500,
  info: 4500,
  success: 4000,
  warning: 5500,
  error: 7000,
  action: 8000,
};

function iconFor(variant: ToastVariant) {
  const props = { className: "size-3.5", "aria-hidden": true as const };
  switch (variant) {
    case "success":
      return createElement(Check, props);
    case "error":
      return createElement(AlertCircle, props);
    case "warning":
      return createElement(TriangleAlert, props);
    case "info":
    case "default":
      return createElement(Info, props);
    default:
      return undefined;
  }
}

function normalizeBody(
  input: string | { title: string; description?: ReactNode },
) {
  return typeof input === "string" ? { title: input } : input;
}

function toOptions(
  input: ToastInput,
  variant: ToastVariant,
  options?: ToastOptions,
) {
  const base = typeof input === "string" ? { title: input } : input;
  const duration =
    base.duration ??
    options?.duration ??
    DEFAULT_DURATION[variant];

  return {
    title: base.title,
    description: base.description ?? options?.description,
    duration: duration === null || duration <= 0 ? null : duration,
    position: base.position ?? options?.position,
    button: base.action ?? options?.action,
    icon: base.icon !== undefined ? base.icon : (options?.icon ?? iconFor(variant)),
    autopilot: {
      expand: 480,
      collapse: Math.max(1200, (typeof duration === "number" ? duration : 4500) - 900),
    },
  };
}

function show(
  input: ToastInput,
  variant: ToastVariant,
  options?: ToastOptions,
) {
  const opts = toOptions(input, variant, options);
  switch (variant) {
    case "success":
      return sileo.success(opts);
    case "error":
      return sileo.error(opts);
    case "warning":
      return sileo.warning(opts);
    case "action":
      return sileo.action(opts);
    case "info":
      return sileo.info(opts);
    default:
      return sileo.info(opts);
  }
}

export const toast = {
  show(input: ToastInput, options?: ToastOptions) {
    return show(input, "default", options);
  },
  message(title: string, options?: ToastOptions) {
    return show({ title, ...options }, "default", options);
  },
  info(title: string, options?: ToastOptions) {
    return show({ title, ...options }, "info", options);
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
  action(title: string, options?: ToastOptions) {
    return show({ title, ...options }, "action", options);
  },
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: ToastPromiseMessages<T>,
    options?: Pick<ToastOptions, "position">,
  ) {
    const loading = normalizeBody(messages.loading);
    return sileo.promise(promise, {
      position: options?.position,
      loading: {
        title: loading.title,
        description: loading.description,
        icon: createElement(Info, {
          className: "size-3.5 animate-pulse",
          "aria-hidden": true,
        }),
      },
      success: (data) => {
        const body = normalizeBody(
          typeof messages.success === "function"
            ? messages.success(data)
            : messages.success,
        );
        return {
          title: body.title,
          description: body.description,
          duration: DEFAULT_DURATION.success,
          icon: iconFor("success"),
          autopilot: { expand: 480, collapse: 3100 },
        };
      },
      error: (err) => {
        const body = normalizeBody(
          typeof messages.error === "function"
            ? messages.error(err)
            : messages.error,
        );
        return {
          title: body.title,
          description: body.description,
          duration: DEFAULT_DURATION.error,
          icon: iconFor("error"),
          autopilot: { expand: 480, collapse: 5800 },
        };
      },
    });
  },
  dismiss(id?: string) {
    if (id) sileo.dismiss(id);
    else sileo.clear();
  },
};

export type { ToastOptions, ToastVariant, ToastPromiseMessages };
