/** Public legal / GDPR controller details — override via env in production. */

export type SiteLegal = {
  productName: string;
  controllerName: string;
  controllerIco: string | null;
  address: string | null;
  contactEmail: string;
  privacyEmail: string;
  effectiveDateIso: string;
  jurisdiction: string;
};

function trimOrNull(value: string | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

export function getSiteLegal(): SiteLegal {
  const contactEmail =
    process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL?.trim() ||
    "privacy@fakturio.sk";

  return {
    productName: "Fakturio",
    controllerName:
      process.env.NEXT_PUBLIC_LEGAL_CONTROLLER_NAME?.trim() || "Fakturio",
    controllerIco: trimOrNull(process.env.NEXT_PUBLIC_LEGAL_CONTROLLER_ICO),
    address: trimOrNull(process.env.NEXT_PUBLIC_LEGAL_ADDRESS),
    contactEmail,
    privacyEmail:
      process.env.NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL?.trim() || contactEmail,
    effectiveDateIso:
      process.env.NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE?.trim() || "2026-10-31",
    jurisdiction: "Slovenská republika / European Union",
  };
}
