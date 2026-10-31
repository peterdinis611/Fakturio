import type { RegistryCompany } from "@/shared/api/types";
import { isValidDic, isValidIcDph } from "@/shared/lib/validations/sk";

const LEGAL_FORM_MAP: Array<{ match: RegExp; value: string }> = [
  { match: /s\.?\s*r\.?\s*o\.?|ručením\s+obmedzeným|ručenim\s+obmedzenym/i, value: "s.r.o." },
  { match: /a\.?\s*s\.?|akciov/i, value: "a.s." },
  { match: /k\.?\s*s\.?|komanditn/i, value: "k.s." },
  { match: /v\.?\s*o\.?\s*s\.?|verejn[aá]\s+obchodn/i, value: "v.o.s." },
  { match: /živnost|zivnost|szčo|szco|fyzick|podnikate/i, value: "SZČO" },
];

export function mapRegistryLegalForm(legalForm: string | null | undefined): string | null {
  if (!legalForm?.trim()) return null;
  const normalized = legalForm.trim();
  for (const entry of LEGAL_FORM_MAP) {
    if (entry.match.test(normalized)) return entry.value;
  }
  return "iné";
}

export type RegistryAutofillFields = {
  name: string;
  ico: string;
  dic?: string | null;
  icDph?: string | null;
  isVatPayer?: boolean | null;
  street?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country: string;
  legalForm?: string | null;
  commercialRegister?: string | null;
};

/** Map registry payload onto form-friendly values (SK/CZ safe). */
export function toRegistryAutofill(
  data: RegistryCompany,
  opts: { includeCompanyExtras?: boolean } = {},
): RegistryAutofillFields {
  const fields: RegistryAutofillFields = {
    name: data.name,
    ico: data.ico,
    country: data.countryCode || data.country,
    street: data.street,
    city: data.city,
    postalCode: data.postalCode,
  };

  if (data.dic && isValidDic(data.dic)) {
    fields.dic = data.dic;
  }

  if (data.icDph && isValidIcDph(data.icDph)) {
    fields.icDph = data.icDph.trim().toUpperCase();
  }

  if (typeof data.isVatPayer === "boolean") {
    fields.isVatPayer = data.isVatPayer;
  } else if (fields.icDph) {
    fields.isVatPayer = true;
  }

  if (opts.includeCompanyExtras) {
    fields.legalForm = mapRegistryLegalForm(data.legalForm);
    fields.commercialRegister = data.commercialRegister;
  }

  return fields;
}
