/** Slovak / SEPA field checks aligned with backend SlovakValidators. */

const ALLOWED_VAT = new Set([0, 5, 19, 23]);

/** Strip spaces / whitespace so "57 267 073" is accepted as IČO. */
export function normalizeIco(value: string): string {
  return value.replace(/\s+/g, "");
}

export function isValidIco(value: string): boolean {
  const ico = normalizeIco(value);
  if (!/^\d{8}$/.test(ico)) return false;
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += Number(ico[i]) * (8 - i);
  const remainder = sum % 11;
  const check = remainder === 0 ? 1 : remainder === 1 ? 0 : 11 - remainder;
  return check === Number(ico[7]);
}

export function isValidDic(value: string): boolean {
  return /^\d{10}$/.test(value);
}

export function isValidIcDph(value: string): boolean {
  return /^SK\d{10}$/i.test(value.trim());
}

export function isValidIban(value: string): boolean {
  const normalized = value.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(normalized)) return false;

  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  const numeric = rearranged
    .split("")
    .map((c) => (/[A-Z]/.test(c) ? String(c.charCodeAt(0) - 55) : c))
    .join("");

  let remainder = 0;
  for (const ch of numeric) {
    remainder = (remainder * 10 + Number(ch)) % 97;
  }
  return remainder === 1;
}

export function isValidBic(value: string): boolean {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(value.trim());
}

export function isValidCountryCode(value: string): boolean {
  return /^[A-Za-z]{2}$/.test(value.trim());
}

export function isValidCurrency(value: string): boolean {
  return /^[A-Za-z]{3}$/.test(value.trim());
}

export function isAllowedVatRate(rate: number): boolean {
  return ALLOWED_VAT.has(rate);
}

export function isValidVariableSymbol(value: string): boolean {
  return /^\d{1,10}$/.test(value);
}

export function isValidPostalCode(value: string): boolean {
  return /^\d{3}\s?\d{2}$/.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
