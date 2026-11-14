import DOMPurify from "isomorphic-dompurify";

const NOTE_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "span",
  "div",
  "aside",
  "sub",
  "sup",
  "mark",
] as const;

const NOTE_ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "class",
  "style",
  "colspan",
  "rowspan",
  "data-type",
  "data-variant",
  "data-checked",
  "data-color",
] as const;

/** Strip dangerous HTML from TipTap note bodies (save + render). */
export function sanitizeNoteHtml(html: string): string {
  if (!html.trim()) return "";

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...NOTE_ALLOWED_TAGS],
    ALLOWED_ATTR: [...NOTE_ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?):|mailto:|tel:|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ["target"],
  });
}

/** True when href/src uses http(s) only. */
export function isSafeHttpUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
