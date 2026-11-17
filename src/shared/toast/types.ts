import type { ReactNode } from "react";
import type { SileoPosition } from "sileo";

export type ToastVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "action";

export type ToastAction = {
  title: string;
  onClick: () => void;
};

export type ToastOptions = {
  id?: string;
  description?: ReactNode;
  duration?: number | null;
  /** Show dismiss control (default true). */
  dismissible?: boolean;
  position?: SileoPosition;
  action?: ToastAction;
  icon?: ReactNode | null;
};

export type ToastRecord = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  dismissible: boolean;
  createdAt: number;
};

export type ToastInput = string | (ToastOptions & { title: string });

export type ToastPromiseMessages<T> = {
  loading: string | { title: string; description?: ReactNode };
  success: string | ((data: T) => string | { title: string; description?: ReactNode });
  error: string | ((err: unknown) => string | { title: string; description?: ReactNode });
};
