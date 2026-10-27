export type LineTemplate = {
  id: string;
  description: string;
  unit: string;
  unitPrice: number;
  vatRate: number;
};

const STORAGE_KEY = "fakturio.line-templates";

const DEFAULTS: LineTemplate[] = [
  {
    id: "consulting",
    description: "Konzultačné služby",
    unit: "hod",
    unitPrice: 45,
    vatRate: 23,
  },
  {
    id: "dev",
    description: "Vývoj softvéru",
    unit: "hod",
    unitPrice: 55,
    vatRate: 23,
  },
  {
    id: "hosting",
    description: "Hosting / prevádzka",
    unit: "mes",
    unitPrice: 25,
    vatRate: 23,
  },
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadLineTemplates(): LineTemplate[] {
  if (!canUseStorage()) return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
      return DEFAULTS;
    }
    const parsed = JSON.parse(raw) as LineTemplate[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveLineTemplates(templates: LineTemplate[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function upsertLineTemplate(
  templates: LineTemplate[],
  next: Omit<LineTemplate, "id"> & { id?: string },
): LineTemplate[] {
  const id = next.id ?? `t-${Date.now().toString(36)}`;
  const item: LineTemplate = {
    id,
    description: next.description.trim(),
    unit: next.unit.trim() || "ks",
    unitPrice: Number(next.unitPrice) || 0,
    vatRate: Number(next.vatRate) || 0,
  };
  const idx = templates.findIndex((t) => t.id === id);
  if (idx >= 0) {
    const copy = [...templates];
    copy[idx] = item;
    return copy;
  }
  return [...templates, item];
}

export function removeLineTemplate(templates: LineTemplate[], id: string) {
  return templates.filter((t) => t.id !== id);
}
