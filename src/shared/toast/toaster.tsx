"use client";

import { useTheme } from "@teispace/next-themes";
import { Toaster as SileoToaster } from "sileo";
import "./sileo-theme.css";
import { useEffect, useState } from "react";

const LIGHT = {
  fill: "#12151a",
  styles: {
    title:
      "font-[family-name:var(--font-plex)]! text-[13px]! font-medium! tracking-[-0.01em]! normal-case! text-[#f7f8fa]!",
    description:
      "font-[family-name:var(--font-plex)]! text-[13px]! leading-5! text-[#f7f8fa]/72!",
    badge: "bg-white/10! ring-1 ring-inset ring-white/10!",
    button:
      "rounded-[4px]! font-[family-name:var(--font-plex)]! text-[12px]! font-medium! bg-white/12! hover:bg-white/18!",
  },
} as const;

const DARK = {
  fill: "#f7f8fa",
  styles: {
    title:
      "font-[family-name:var(--font-plex)]! text-[13px]! font-medium! tracking-[-0.01em]! normal-case! text-[#12151a]!",
    description:
      "font-[family-name:var(--font-plex)]! text-[13px]! leading-5! text-[#12151a]/70!",
    badge: "bg-black/8! ring-1 ring-inset ring-black/8!",
    button:
      "rounded-[4px]! font-[family-name:var(--font-plex)]! text-[12px]! font-medium! bg-black/8! hover:bg-black/12!",
  },
} as const;

export function Toaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const skin = isDark ? DARK : LIGHT;

  return (
    <SileoToaster
      position="top-right"
      theme={isDark ? "dark" : "light"}
      offset={{ top: 18, right: 18, bottom: 18, left: 18 }}
      options={{
        fill: skin.fill,
        roundness: 6,
        styles: skin.styles,
        autopilot: {
          expand: 480,
          collapse: 3600,
        },
        duration: 4500,
      }}
    />
  );
}
