"use client";

import { useAppHotkeys, useHotkeys } from "@tanstack/react-hotkeys";
import { useRouter } from "@/i18n/navigation";

/** Registers global navigation shortcuts while the app shell is mounted. */
export function AppNavigationHotkeys() {
  const router = useRouter();
  const keys = useAppHotkeys();

  useHotkeys([
    {
      hotkey: keys["nav.dashboard"],
      callback: () => router.push("/dashboard"),
    },
    {
      hotkey: keys["nav.invoices"],
      callback: () => router.push("/invoices"),
    },
    {
      hotkey: keys["nav.customers"],
      callback: () => router.push("/customers"),
    },
    {
      hotkey: keys["nav.services"],
      callback: () => router.push("/services"),
    },
    {
      hotkey: keys["nav.notes"],
      callback: () => router.push("/notes"),
    },
    {
      hotkey: keys["nav.payments"],
      callback: () => router.push("/payments/import"),
    },
    {
      hotkey: keys["nav.search"],
      callback: () => router.push("/search"),
    },
    {
      hotkey: keys["nav.settings"],
      callback: () => router.push("/settings"),
    },
    {
      hotkey: keys["nav.newInvoice"],
      callback: () => router.push("/invoices/new"),
    },
  ]);

  return null;
}
