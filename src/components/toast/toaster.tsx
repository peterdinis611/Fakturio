"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { XIcon } from "lucide-react";
import {
  dismissToast,
  getToasts,
  subscribeToasts,
  type ToastRecord,
  type ToastVariant,
} from "@/lib/toast";
import "./toast.css";

const EMPTY_TOASTS: ToastRecord[] = [];
const getServerToasts = () => EMPTY_TOASTS;

const MARK: Record<ToastVariant, string> = {
  default: "i",
  success: "OK",
  error: "!",
  warning: "!",
};

function ToastItem({ toast }: { toast: ToastRecord }) {
  const [leaving, setLeaving] = useState(false);

  function close() {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => dismissToast(toast.id), 150);
  }

  useEffect(() => {
    if (toast.duration <= 0 || !toast.dismissible) return;
    // Soft leave shortly before store removal for exit animation.
    const lead = Math.max(0, toast.duration - 160);
    const timer = window.setTimeout(() => setLeaving(true), lead);
    return () => window.clearTimeout(timer);
  }, [toast.duration, toast.dismissible, toast.id]);

  return (
    <div
      className="fk-toast"
      data-variant={toast.variant}
      data-leaving={leaving ? "true" : "false"}
      role={toast.variant === "error" ? "alert" : "status"}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
    >
      <span className="fk-toast-mark" aria-hidden>
        {MARK[toast.variant]}
      </span>
      <div className="fk-toast-body">
        <p className="fk-toast-title">{toast.title}</p>
        {toast.description ? (
          <p className="fk-toast-description">{toast.description}</p>
        ) : null}
      </div>
      {toast.dismissible ? (
        <button
          type="button"
          className="fk-toast-close"
          aria-label="Zavrieť"
          onClick={close}
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function Toaster() {
  const toasts = useSyncExternalStore(
    subscribeToasts,
    getToasts,
    getServerToasts,
  );

  if (toasts.length === 0) return null;

  return (
    <div className="fk-toaster" aria-label="Notifikácie">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
