import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-[4px] border border-border bg-surface px-3 text-[14px] text-ink outline-none transition-colors",
        "placeholder:text-faint",
        "hover:border-control",
        "focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-negative aria-invalid:ring-2 aria-invalid:ring-negative/15",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
