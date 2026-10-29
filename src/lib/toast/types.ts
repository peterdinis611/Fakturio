export type ToastVariant = "default" | "success" | "error" | "warning";

export type ToastOptions = {
  id?: string;
  description?: string;
  duration?: number;
  /** Show dismiss control (default true). */
  dismissible?: boolean;
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
