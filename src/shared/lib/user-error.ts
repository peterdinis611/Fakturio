/** Map API / server errors into short Slovak messages safe for toasts. */

const BY_CODE: Record<string, string> = {
  server_unreachable: "Server je nedostupný. Skontroluj pripojenie a skús znova.",
  not_found: "Záznam sa nenašiel.",
  bad_request: "Neplatná požiadavka.",
  conflict: "Konflikt údajov.",
  unauthorized: "Nie si prihlásený alebo vypršala relácia.",
  validation_failed: "Skontroluj formulár.",
  customer_not_found: "Odberateľ sa nenašiel.",
  duplicate_ico: "Odberateľ s týmto IČO už existuje.",
  duplicate_email: "Tento e-mail už je použitý.",
  has_invoices: "Odberateľa nie je možné zmazať, má faktúry.",
  invoice_not_found: "Faktúra sa nenašla.",
  not_draft: "Akcia je dostupná len pre koncept.",
  draft: "Doklad je stále koncept.",
  cancelled: "Doklad je zrušený.",
  already_cancelled: "Doklad už je zrušený.",
  paid: "Doklad je už uhradený.",
  paid_to_draft: "Uhradený doklad nie je možné vrátiť do konceptu.",
  invalid_paid_at: "Neplatný dátum úhrady.",
  invalid_status: "Neplatný stav dokladu.",
  invalid_document_type: "Neplatný typ dokladu.",
  use_cancel_endpoint: "Na zrušenie použite akciu Zrušiť.",
  invalid_date_range: "Neplatný rozsah dátumov.",
  date_range_too_large: "Rozsah dátumov je príliš veľký.",
  invalid_search_query: "Neplatný vyhľadávací výraz.",
  invalid_invoice_total: "Neplatná suma faktúry.",
  invalid_invoice_items: "Neplatné položky faktúry.",
  empty_guid: "Neplatný identifikátor.",
  invalid_ico: "Neplatné IČO (8 číslic + kontrolná cifra).",
  unsupported_country: "Doplnenie z registra je dostupné pre SK a CZ.",
  registry_not_found: "Firma s týmto IČO sa v registri nenašla.",
  registry_unavailable: "Register je dočasne nedostupný. Skús neskôr.",
};

const BY_EXACT_EN: Record<string, string> = {
  "name is required.": "Názov je povinný.",
  "company name is required.": "Názov firmy je povinný.",
  "customer not found.": "Odberateľ sa nenašiel.",
  "user not found.": "Používateľ sa nenašiel.",
  "a customer with this ičo already exists.": "Odberateľ s týmto IČO už existuje.",
  "a customer with this email already exists.": "Odberateľ s týmto e-mailom už existuje.",
  "ičo must be 8 digits with a valid checksum.": "IČO musí mať 8 číslic s platnou kontrolnou cifrou.",
  "dič must be exactly 10 digits.": "DIČ musí mať presne 10 číslic.",
  "ič dph must match format sk + 10 digits.": "IČ DPH musí byť v tvare SK + 10 číslic.",
  "ič dph is required when the company is a vat payer.": "IČ DPH je povinné pri platcovi DPH.",
  "postal code must look like 811 01.": "PSČ musí byť v tvare 811 01.",
  "country must be a 2-letter iso code.": "Krajina musí byť 2-písmenový ISO kód.",
  "iban is invalid.": "IBAN je neplatný.",
  "bic/swift is invalid.": "BIC/SWIFT je neplatný.",
  "supported countries are sk and cz.": "Doplnenie z registra je dostupné pre SK a CZ.",
  "company registry is temporarily unavailable.": "Register je dočasne nedostupný. Skús neskôr.",
  "ares registry is temporarily unavailable.": "Register ARES je dočasne nedostupný. Skús neskôr.",
  "rpo registry is temporarily unavailable.": "Register RPO je dočasne nedostupný. Skús neskôr.",
  "server unavailable": "Server je nedostupný. Skontroluj pripojenie a skús znova.",
  "could not reach the api server.": "Server je nedostupný. Skontroluj pripojenie a skús znova.",
  "request failed": "Požiadavka zlyhala.",
};

const BY_PARTIAL_EN: Array<{ match: RegExp; message: string }> = [
  { match: /no slovak company found/i, message: "Firma s týmto IČO sa v registri nenašla." },
  { match: /no czech company found/i, message: "Firma s týmto IČO sa v registri nenašla." },
  { match: /already exists/i, message: "Záznam s týmito údajmi už existuje." },
  { match: /not found/i, message: "Záznam sa nenašiel." },
  { match: /unauthorized|authentication|jwt/i, message: "Nie si prihlásený alebo vypršala relácia." },
  { match: /temporarily unavailable|unavailable/i, message: "Služba je dočasne nedostupná. Skús neskôr." },
  { match: /validation failed|one or more validation/i, message: "Skontroluj formulár." },
];

const GENERIC_SK = "Niečo sa pokazilo. Skús znova.";

/** True for CLR / hot-reload / stack-looking noise that must never hit the UI. */
function looksTechnical(message: string): boolean {
  const m = message.trim();
  if (!m) return true;
  if (/IMAGE_CEE|CALLCONV|LOCAL_SIG|HRESULT|0x[0-9A-F]{8}/i.test(m)) return true;
  if (/\b(Exception|StackTrace|System\.|Microsoft\.|at\s+\w+\.\w+)/.test(m)) return true;
  if (/Signature is not/i.test(m)) return true;
  if (/^[A-Z0-9_]+(\.[A-Z0-9_]+)+$/.test(m)) return true;
  return false;
}

function hasSlovakChars(message: string): boolean {
  return /[áäčďéíľĺňóôŕšťúýžÁÄČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ]/.test(message);
}

export function toUserFacingError(
  message: string | null | undefined,
  code?: string | null,
): string {
  if (code && BY_CODE[code]) return BY_CODE[code];

  const raw = (message ?? "").trim();
  if (!raw) return GENERIC_SK;
  if (looksTechnical(raw)) return GENERIC_SK;

  const exact = BY_EXACT_EN[raw.toLowerCase()];
  if (exact) return exact;

  for (const entry of BY_PARTIAL_EN) {
    if (entry.match.test(raw)) return entry.message;
  }

  // Keep Slovak copy; hide leftover English API text from toasts.
  if (hasSlovakChars(raw)) return raw;
  if (
    /\b(is|are|must|the|not|invalid|required|failed|error|unable|cannot|could)\b/i.test(
      raw,
    )
  ) {
    return GENERIC_SK;
  }

  if (raw.length <= 120) return raw;
  return GENERIC_SK;
}

export function localizeFieldError(message: string): string {
  return toUserFacingError(message);
}
