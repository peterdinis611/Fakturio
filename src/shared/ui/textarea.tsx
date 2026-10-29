import * as React from "react";
import { cn } from "@/shared/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content flex min-h-20 w-full rounded-[4px] border border-border bg-ground px-3 py-2 text-[14px] text-ink outline-none transition-colors",
        "placeholder:text-faint",
        "hover:border-control",
        "focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-negative",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
