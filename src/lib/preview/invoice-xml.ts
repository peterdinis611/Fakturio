import type { Invoice } from "@/lib/api/types";

function esc(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function party(
  tag: string,
  p: {
    name: string;
    ico: string | null;
    dic: string | null;
    icDph: string | null;
    email: string | null;
    street: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
  },
) {
  return [
    `  <${tag}>`,
    `    <Nazov>${esc(p.name)}</Nazov>`,
    `    <ICO>${esc(p.ico)}</ICO>`,
    `    <DIC>${esc(p.dic)}</DIC>`,
    `    <ICDPH>${esc(p.icDph)}</ICDPH>`,
    `    <Email>${esc(p.email)}</Email>`,
    `    <Ulica>${esc(p.street)}</Ulica>`,
    `    <Mesto>${esc(p.city)}</Mesto>`,
    `    <PSC>${esc(p.postalCode)}</PSC>`,
    `    <Krajina>${esc(p.country)}</Krajina>`,
    `  </${tag}>`,
  ].join("\n");
}

/** Lightweight Slovak invoice XML for preview / accountant hand-off (not a legal e-invoice schema). */
export function buildInvoiceXml(invoice: Invoice): string {
  const items = invoice.items
    .map(
      (it, i) =>
        [
          `    <Polozka poradie="${i + 1}">`,
          `      <Popis>${esc(it.description)}</Popis>`,
          `      <Jednotka>${esc(it.unit)}</Jednotka>`,
          `      <Mnozstvo>${esc(it.quantity)}</Mnozstvo>`,
          `      <JednotkovaCena>${esc(it.unitPrice)}</JednotkovaCena>`,
          `      <SadzbaDPH>${esc(it.vatRate)}</SadzbaDPH>`,
          `      <Zaklad>${esc(it.subtotal)}</Zaklad>`,
          `      <DPH>${esc(it.vatAmount)}</DPH>`,
          `      <Spolu>${esc(it.total)}</Spolu>`,
          `    </Polozka>`,
        ].join("\n"),
    )
    .join("\n");

  const seller = invoice.seller
    ? party("Dodavatel", invoice.seller)
    : "  <Dodavatel />";

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<Faktura xmlns="urn:fakturio:invoice:1" cislo="${esc(invoice.number)}" stav="${esc(invoice.status)}">`,
    `  <Hlavicka>`,
    `    <DatumVystavenia>${esc(invoice.issueDate)}</DatumVystavenia>`,
    `    <DatumSplatnosti>${esc(invoice.dueDate)}</DatumSplatnosti>`,
    `    <DatumDodania>${esc(invoice.deliveryDate)}</DatumDodania>`,
    `    <Mena>${esc(invoice.currency)}</Mena>`,
    `    <VariabilnySymbol>${esc(invoice.variableSymbol)}</VariabilnySymbol>`,
    `    <KonstantnySymbol>${esc(invoice.constantSymbol)}</KonstantnySymbol>`,
    `    <IBAN>${esc(invoice.bankIban)}</IBAN>`,
    `    <BIC>${esc(invoice.bankBic)}</BIC>`,
    `    <Poznamka>${esc(invoice.notes)}</Poznamka>`,
    `  </Hlavicka>`,
    seller,
    party("Odberatel", invoice.customer),
    `  <Polozky>`,
    items || "    <!-- bez položiek -->",
    `  </Polozky>`,
    `  <Sumar>`,
    `    <Zaklad>${esc(invoice.subtotal)}</Zaklad>`,
    `    <DPH>${esc(invoice.vatTotal)}</DPH>`,
    `    <Celkom>${esc(invoice.total)}</Celkom>`,
    `  </Sumar>`,
    `</Faktura>`,
    ``,
  ].join("\n");
}
