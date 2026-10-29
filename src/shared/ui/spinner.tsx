import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

const sizeClass: Record<SpinnerSize, string> = {
  sm: "size-3.5 border-[1.5px]",
  md: "size-5 border-2",
  lg: "size-8 border-2",
};

/** Ledger-style ring spinner (ink on faint track). */
export function Spinner({
  size = "md",
  className,
  label = "Načítavam",
}: {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-border border-t-ink",
        sizeClass[size],
        className,
      )}
    />
  );
}

/** Full-area page / route loading state. */
export function PageLoader({
  label = "Načítavam…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <Spinner size="lg" label={label} />
      <p className="text-[13px] text-muted-foreground">{label}</p>
    </div>
  );
}

/** Compact block placeholder for Suspense sections. */
export function SectionLoader({
  label = "Načítavam…",
  rows = 4,
  className,
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("space-y-3 py-2", className)}
    >
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Spinner size="sm" label={label} />
        <span>{label}</span>
      </div>
      <div className="space-y-2" aria-hidden>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-9 animate-pulse rounded-[4px] bg-raised/80"
            style={{ width: `${88 - i * 8}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Inline pending state for buttons / compact UI. */
export function InlinePending({
  children,
  pending,
  label = "Čakaj…",
}: {
  children: ReactNode;
  pending: boolean;
  label?: string;
}) {
  if (!pending) return children;
  return (
    <span className="inline-flex items-center gap-2">
      <Spinner size="sm" label={label} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
