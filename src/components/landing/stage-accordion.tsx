"use client";

import { useState } from "react";

const stages = [
  {
    name: "Koncept",
    tint: 18,
    body: "Rozpracuj položky, DPH a splatnosť. Číslo faktúry ešte nie je finálne.",
    ui: [
      ["Stav", "Koncept"],
      ["Odberateľ", "Studio Nova s.r.o."],
      ["Položky", "2"],
      ["Spolu", "1 280,00 €"],
    ],
  },
  {
    name: "Vystavená",
    tint: 36,
    body: "Priradí sa číslo a VS. Faktúru pošleš e-mailom alebo PDF.",
    ui: [
      ["Číslo", "FA-2026-0142"],
      ["VS", "20260142"],
      ["Splatnosť", "14 dní"],
      ["Spolu", "1 280,00 €"],
    ],
  },
  {
    name: "Splatnosť",
    tint: 58,
    body: "Prehľad po splatnosti, upomienky a cashflow — bez tabuľkového chaosu.",
    ui: [
      ["Do splatnosti", "3 dni"],
      ["Stav", "Vystavená"],
      ["Upomienka", "Pripravená"],
      ["Spolu", "1 280,00 €"],
    ],
  },
  {
    name: "Zaplatená",
    tint: 78,
    body: "Párovanie podľa VS z bankového CSV. Pečiatka je hotová.",
    ui: [
      ["Stav", "Zaplatená"],
      ["Úhrada", "12. 3. 2026"],
      ["VS zhoda", "Áno"],
      ["Spolu", "1 280,00 €"],
    ],
  },
] as const;

export function StageAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="landing-accordion" role="tablist" aria-label="Životný cyklus faktúry">
      {stages.map((stage, index) => {
        const expanded = open === index;
        return (
          <button
            key={stage.name}
            type="button"
            role="tab"
            aria-selected={expanded}
            aria-expanded={expanded}
            className="landing-stage"
            style={{ ["--stage-tint" as string]: stage.tint }}
            onClick={() => setOpen(index)}
          >
            <div className="landing-stage-label">{stage.name}</div>
            <p className="landing-stage-body">{stage.body}</p>
            <div className="landing-stage-ui" data-ui>
              {stage.ui.map(([k, v]) => (
                <div className="row" key={k}>
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
