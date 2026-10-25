/** Minimal CSV parser for `;` or `,` exports (quoted fields supported). */

export type CsvTable = {
  headers: string[];
  rows: string[][];
};

function detectDelimiter(sample: string): ";" | "," {
  const line = sample.split(/\r?\n/).find((l) => l.trim()) ?? "";
  const semis = (line.match(/;/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return semis >= commas ? ";" : ",";
}

function parseLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      cells.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

/** Strip UTF-8 BOM if present. */
export function stripBom(text: string) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

export function parseCsv(text: string, maxRows = 200): CsvTable {
  const raw = stripBom(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = raw.split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const delimiter = detectDelimiter(lines[0] ?? "");
  const headers = parseLine(lines[0] ?? "", delimiter);
  const rows = lines
    .slice(1, maxRows + 1)
    .map((l) => parseLine(l, delimiter));

  return { headers, rows };
}
