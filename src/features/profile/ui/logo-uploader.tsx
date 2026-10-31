"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import {
  deleteCompanyLogoAction,
  uploadCompanyLogoAction,
} from "@/features/company/api/company";
import { LOGO_MAX_BYTES, LOGO_TYPES } from "@/features/company/model/logo";
import { toast } from "@/shared/toast";
import { toUserFacingError } from "@/shared/lib/user-error";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/utils";
import "./logo-uploader.css";

type Props = {
  logoUrl: string | null;
};

type NativeFileItem = {
  files: File[];
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateLogoFile(file: File, t: ReturnType<typeof useTranslations<"Profile">>) {
  if (file.size > LOGO_MAX_BYTES) {
    return t("logoTooLarge", { max: "2 MB" });
  }
  if (file.type && !LOGO_TYPES.has(file.type)) {
    return t("logoBadType");
  }
  return null;
}

function LogoDropZone({ logoUrl }: Props) {
  const t = useTranslations("Profile");
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const displayUrl = preview ?? logoUrl;

  const upload = useCallback(
    (file: File) => {
      const message = validateLogoFile(file, t);
      if (message) {
        setError(message);
        toast.error(message);
        return;
      }

      setError(null);
      if (preview) URL.revokeObjectURL(preview);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const formData = new FormData();
      formData.append("file", file, file.name);

      startTransition(async () => {
        try {
          await uploadCompanyLogoAction(formData);
          toast.success(t("logoSaved"));
          router.refresh();
        } catch (err) {
          setPreview(null);
          URL.revokeObjectURL(objectUrl);
          const msg = toUserFacingError(
            err instanceof Error ? err.message : undefined,
          );
          setError(msg);
          toast.error(msg);
        }
      });
    },
    [preview, router, t],
  );

  const dropRef = useRef<HTMLDivElement | null>(null);

  const [{ isOver, canDrop }, connectDrop] = useDrop<
    NativeFileItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item) {
        const file = item.files?.[0];
        if (file) upload(file);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [upload],
  );

  connectDrop(dropRef);

  const active = isOver && canDrop;

  function onPick(files: FileList | null) {
    const file = files?.[0];
    if (file) upload(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onRemove() {
    startTransition(async () => {
      try {
        if (preview) {
          URL.revokeObjectURL(preview);
          setPreview(null);
        }
        await deleteCompanyLogoAction();
        toast.success(t("logoRemoved"));
        router.refresh();
      } catch (err) {
        toast.error(
          toUserFacingError(err instanceof Error ? err.message : undefined),
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      <div
        ref={dropRef}
        className={cn("logo-drop", pending && "pointer-events-none opacity-90")}
        data-active={active ? "true" : "false"}
        data-invalid={error ? "true" : "false"}
        data-pending={pending ? "true" : "false"}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-controls={inputId}
        aria-label={t("logoDropAria")}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          disabled={pending}
          onChange={(e) => onPick(e.target.files)}
        />

        {displayUrl ? (
          <div className="logo-drop__preview">
            <div className="logo-drop__stamp">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayUrl} alt="" />
            </div>
            <div className="logo-drop__meta">
              <p className="logo-drop__title">
                {pending ? t("logoUploading") : t("logoReady")}
              </p>
              <p className="logo-drop__hint">{t("logoReplaceHint")}</p>
              <div className="logo-drop__actions mt-2.5">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  {pending ? (
                    <Spinner size="sm" label={t("logoUpload")} />
                  ) : (
                    <Upload className="size-3.5" aria-hidden />
                  )}
                  {t("logoReplace")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  {t("logoRemove")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="logo-drop__empty">
            <span className="logo-drop__glyph" aria-hidden>
              {pending ? (
                <Spinner size="sm" label={t("logoUploading")} />
              ) : (
                <ImagePlus className="size-4" strokeWidth={1.5} />
              )}
            </span>
            <div>
              <p className="logo-drop__title">
                {active ? t("logoDropNow") : t("logoDropTitle")}
              </p>
              <p className="logo-drop__hint">
                {t("logoDropHint", {
                  max: formatBytes(LOGO_MAX_BYTES),
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[12px] text-negative" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-[12px] text-muted-foreground">{t("logoFootnote")}</p>
      )}
    </div>
  );
}

export function LogoUploader({ logoUrl }: Props) {
  return (
    <DndProvider backend={HTML5Backend}>
      <LogoDropZone logoUrl={logoUrl} />
    </DndProvider>
  );
}
