import { defineAppHotkeys } from "@tanstack/react-hotkeys";

/**
 * Declared app shortcuts. Ids are a stable contract for per-user custom bindings.
 * Display names are English defaults; the settings UI translates by id.
 */
export const appHotkeys = defineAppHotkeys({
  "nav.dashboard": {
    hotkey: ["G", "D"],
    meta: { name: "Go to dashboard", group: "Navigation" },
    options: { timeout: 800 },
  },
  "nav.invoices": {
    hotkey: ["G", "I"],
    meta: { name: "Go to invoices", group: "Navigation" },
    options: { timeout: 800 },
  },
  "nav.customers": {
    hotkey: ["G", "C"],
    meta: { name: "Go to customers", group: "Navigation" },
    options: { timeout: 800 },
  },
  "nav.services": {
    hotkey: ["G", "S"],
    meta: { name: "Go to services", group: "Navigation" },
    options: { timeout: 800 },
  },
  "nav.notes": {
    hotkey: ["G", "N"],
    meta: { name: "Go to notes", group: "Navigation" },
    options: { timeout: 800 },
  },
  "nav.payments": {
    hotkey: ["G", "P"],
    meta: { name: "Go to payment import", group: "Navigation" },
    options: { timeout: 800 },
  },
  "nav.search": {
    hotkey: "Mod+K",
    meta: { name: "Search", group: "Navigation" },
  },
  "nav.settings": {
    hotkey: "Mod+,",
    meta: { name: "Open settings", group: "Navigation" },
  },
  "nav.newInvoice": {
    hotkey: "Mod+Shift+N",
    meta: { name: "New invoice", group: "Navigation" },
  },
  "invoice.save": {
    hotkey: "Mod+Enter",
    meta: { name: "Save invoice", group: "Invoice" },
    options: { ignoreInputs: false },
  },
  "invoice.addLine": {
    hotkey: "Mod+Shift+Enter",
    meta: { name: "Add invoice line", group: "Invoice" },
    options: { ignoreInputs: false },
  },
  "invoice.removeEmptyLine": {
    hotkey: "Mod+Shift+Backspace",
    meta: { name: "Remove empty line", group: "Invoice" },
    options: { ignoreInputs: false },
  },
});

declare module "@tanstack/react-hotkeys" {
  interface Register {
    appHotkeys: typeof appHotkeys;
  }
}
