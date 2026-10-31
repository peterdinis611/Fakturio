"use client";

import {
  HotkeysProvider,
  type CustomHotkeys,
} from "@tanstack/react-hotkeys";
import { useEffect, useState, type ReactNode } from "react";
import { appHotkeys } from "@/shared/hotkeys/app-hotkeys";
import {
  loadCustomHotkeys,
  saveCustomHotkeys,
} from "@/shared/hotkeys/storage";
import { AppNavigationHotkeys } from "@/shared/hotkeys/app-navigation-hotkeys";

type Props = {
  userId: string;
  children: ReactNode;
};

export function AppHotkeysProvider({ userId, children }: Props) {
  // undefined = not hydrated yet (do not overwrite in-provider edits)
  const [customHotkeys, setCustomHotkeys] = useState<
    CustomHotkeys | undefined
  >(undefined);

  useEffect(() => {
    setCustomHotkeys(loadCustomHotkeys(userId));
  }, [userId]);

  return (
    <HotkeysProvider
      appHotkeys={appHotkeys}
      customHotkeys={customHotkeys}
      onCustomHotkeysChange={(next) => {
        setCustomHotkeys(next);
        saveCustomHotkeys(userId, next);
      }}
      defaultOptions={{
        hotkey: {
          preventDefault: true,
          stopPropagation: true,
        },
      }}
    >
      <AppNavigationHotkeys />
      {children}
    </HotkeysProvider>
  );
}
