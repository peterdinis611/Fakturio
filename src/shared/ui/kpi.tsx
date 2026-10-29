import { cn } from "@/shared/lib/utils";

export function Kpi({
  label,
  value,
  hint,
  signal,
  lead,
}: {
  label: string;
  value: string;
  hint?: string;
  signal?: boolean;
  lead?: boolean;
}) {
  return (
    <div className="min-w-0 py-1">
      <p className="text-[14px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 money tracking-tight",
          lead ? "text-[30px] leading-9" : "text-[24px] leading-8 font-medium",
          signal ? "text-negative" : "text-ink",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
