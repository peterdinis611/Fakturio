"use client";

import {
  formatForDisplay,
  isCustomHotkey,
  useAppHotkeyList,
  useAppHotkeys,
  useCustomHotkeys,
  useHotkeyRecorder,
  type AppHotkeyId,
} from "@tanstack/react-hotkeys";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const GROUP_ORDER = ["Navigation", "Invoice"] as const;

function displayLabel(hotkey: Parameters<typeof formatForDisplay>[0] | null) {
  if (!hotkey) return null;
  const formatted = formatForDisplay(hotkey);
  return Array.isArray(formatted) ? formatted.join(" → ") : formatted;
}

function ShortcutRow({ id }: { id: AppHotkeyId }) {
  const t = useTranslations("Hotkeys");
  const appHotkey = useAppHotkeys()[id];
  const { findConflicts, setCustomHotkey, resetCustomHotkey } =
    useCustomHotkeys();

  const idKey = `ids.${id}` as Parameters<typeof t>[0];

  const recorder = useHotkeyRecorder({
    maxSteps: Infinity,
    validate: (hotkey) => {
      const [conflict] = findConflicts(id, hotkey);
      if (!conflict) return true;
      const conflictKey = `ids.${conflict.id}` as Parameters<typeof t>[0];
      const name = t.has(conflictKey)
        ? t(conflictKey)
        : (conflict.meta?.name ?? conflict.id);
      return t("conflict", { name });
    },
    onRecord: (hotkey) => setCustomHotkey(id, hotkey),
    onClear: () => setCustomHotkey(id, null),
  });

  const label = t.has(idKey) ? t(idKey) : (appHotkey.meta?.name ?? id);
  const current = displayLabel(appHotkey.hotkey);
  const isCustom = isCustomHotkey(appHotkey);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink">{label}</p>
        {isCustom ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {t("customized")}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={recorder.startRecording}
          className={cn(
            "min-w-[7.5rem] rounded-[4px] border px-2.5 py-1.5 text-left font-mono text-[12px] transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20",
            recorder.isRecording
              ? "border-ink bg-ink text-primary-foreground"
              : "border-control bg-surface text-ink hover:bg-raised",
          )}
          aria-label={t("recordAria", { name: label })}
        >
          {recorder.isRecording
            ? recorder.steps.length > 0
              ? displayLabel(recorder.steps) ?? t("pressKeys")
              : t("pressKeys")
            : (current ?? t("unassigned"))}
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!isCustom && !recorder.isRecording}
          onClick={() => {
            if (recorder.isRecording) {
              recorder.cancelRecording();
              return;
            }
            resetCustomHotkey(id);
          }}
          aria-label={t("resetAria", { name: label })}
          title={t("reset")}
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function ShortcutsForm() {
  const t = useTranslations("Hotkeys");
  const items = useAppHotkeyList();
  const { resetCustomHotkeys } = useCustomHotkeys();

  const byGroup = new Map<string, AppHotkeyId[]>();
  for (const { appHotkey } of items) {
    const group = appHotkey.meta?.group ?? "Other";
    const list = byGroup.get(group) ?? [];
    list.push(appHotkey.id as AppHotkeyId);
    byGroup.set(group, list);
  }

  const groups = [
    ...GROUP_ORDER.filter((g) => byGroup.has(g)),
    ...[...byGroup.keys()].filter(
      (g) => !GROUP_ORDER.includes(g as (typeof GROUP_ORDER)[number]),
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-md text-[13px] text-muted-foreground">
          {t("lead")}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => resetCustomHotkeys()}
        >
          {t("resetAll")}
        </Button>
      </div>

      {groups.map((group) => (
        <section key={group}>
          <h3 className="mb-1 text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
            {t.has(`groups.${group}` as never)
              ? t(`groups.${group}` as never)
              : group}
          </h3>
          <div className="rounded-[6px] border border-border bg-ground/30 px-3">
            {(byGroup.get(group) ?? []).map((id) => (
              <ShortcutRow key={id} id={id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
