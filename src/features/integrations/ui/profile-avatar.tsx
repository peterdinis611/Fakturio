"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { lookupAvatarAction } from "@/features/integrations/api/integrations";

type Props = {
  email: string;
  /** Shown while loading / when no avatar exists. */
  fallback: React.ReactNode;
  className?: string;
};

/** Gravatar image via `/api/integrations/avatar`; falls back to initials. */
export function ProfileAvatar({ email, fallback, className }: Props) {
  const t = useTranslations("Registry");
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void lookupAvatarAction({ email }).then((result) => {
      if (cancelled) return;
      const data = result?.data;
      setUrl(data?.gravatarUrl ?? data?.libravatarUrl ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (!url) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={t("avatarAlt")}
      width={88}
      height={88}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setUrl(null)}
    />
  );
}
