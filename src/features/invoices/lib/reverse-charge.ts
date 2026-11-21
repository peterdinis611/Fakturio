/**
 * Mirrors backend `InvoiceLegalTexts.IsReverseCharge`: EU B2B reverse charge
 * when seller is a VAT payer, buyer has IČ DPH in another EU country, and lines are 0 % VAT.
 */
const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE",
]);

export type ReverseChargeInput = {
  sellerIsVatPayer: boolean;
  sellerCountry?: string | null;
  customerCountry?: string | null;
  customerIcDph?: string | null;
  itemsAllZeroVat: boolean;
};

function normalizeCountry(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim().toUpperCase();
  return trimmed || "SK";
}

export function isReverseCharge({
  sellerIsVatPayer,
  sellerCountry,
  customerCountry,
  customerIcDph,
  itemsAllZeroVat,
}: ReverseChargeInput): boolean {
  if (!sellerIsVatPayer) return false;
  if (!customerIcDph || customerIcDph.trim() === "") return false;

  const buyer = normalizeCountry(customerCountry);
  const seller = normalizeCountry(sellerCountry);
  if (!EU_COUNTRIES.has(buyer)) return false;
  if (buyer === seller) return false;

  return itemsAllZeroVat;
}

/** True when there is at least one item and all of them have a 0 % VAT rate. */
export function allItemsZeroVat(
  items: ReadonlyArray<{ vatRate?: unknown }> | null | undefined,
): boolean {
  if (!items || items.length === 0) return false;
  return items.every((item) => Number(item.vatRate ?? 0) === 0);
}
