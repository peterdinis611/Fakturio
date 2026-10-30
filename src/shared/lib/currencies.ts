import { countryFlag } from "@/shared/lib/countries";

export type CurrencyOption = {
  code: string;
  name: string;
  symbol: string;
  /** ISO region used for the flag emoji (EU for euro). */
  flagRegion: string;
};

export const CURRENCIES: CurrencyOption[] = [
  { code: "EUR", name: "Euro", symbol: "€", flagRegion: "EU" },
  { code: "CZK", name: "Česká koruna", symbol: "Kč", flagRegion: "CZ" },
  { code: "USD", name: "Americký dolár", symbol: "$", flagRegion: "US" },
];

const byCode = new Map(CURRENCIES.map((c) => [c.code, c]));

export function getCurrency(code: string | null | undefined) {
  if (!code) return undefined;
  return byCode.get(code.trim().toUpperCase());
}

export function currencyFlag(code: string | null | undefined) {
  const opt = getCurrency(code);
  return countryFlag(opt?.flagRegion ?? "EU");
}

export function currencySymbol(code: string | null | undefined) {
  return getCurrency(code)?.symbol ?? code?.toUpperCase() ?? "";
}
