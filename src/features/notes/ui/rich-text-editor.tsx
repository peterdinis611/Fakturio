"use client";

import { useEffect, useMemo } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  TableIcon,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const BODY_LIMIT = 16000;

const TEXT_COLORS = [
  { value: "", label: "Predvolená" },
  { value: "#e11d48", label: "Červená" },
  { value: "#ea580c", label: "Oranžová" },
  { value: "#ca8a04", label: "Žltá" },
  { value: "#16a34a", label: "Zelená" },
  { value: "#2563eb", label: "Modrá" },
  { value: "#7c3aed", label: "Fialová" },
  { value: "#64748b", label: "Sivá" },
] as const;

const HIGHLIGHT_COLORS = [
  { value: "#fde68a", label: "Žltá" },
  { value: "#bbf7d0", label: "Zelená" },
  { value: "#bfdbfe", label: "Modrá" },
  { value: "#fbcfe8", label: "Ružová" },
  { value: "#e9d5ff", label: "Fialová" },
  { value: "#fecaca", label: "Červená" },
] as const;

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
};

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-[3px] text-muted-foreground transition-colors",
        "hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-40",
        active && "bg-ink text-ground hover:bg-ink hover:text-ground",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <span className="mx-0.5 h-4 w-px shrink-0 bg-border" aria-hidden />;
}

function ColorSwatch({
  color,
  label,
  active,
  disabled,
  onClick,
}: {
  color: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "size-5 rounded-[3px] border border-border transition-transform hover:scale-110 disabled:opacity-40",
        active && "ring-2 ring-ink ring-offset-1 ring-offset-ground",
      )}
      style={
        color
          ? { backgroundColor: color }
          : {
              background:
                "linear-gradient(135deg, transparent 46%, var(--border) 46%, var(--border) 54%, transparent 54%)",
            }
      }
    />
  );
}

function setLink(editor: Editor) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const next = window.prompt("URL odkazu", previous ?? "https://");
  if (next === null) return;
  const href = next.trim();
  if (!href) {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href, target: "_blank", rel: "noopener noreferrer nofollow" })
    .run();
}

function insertImage(editor: Editor) {
  const next = window.prompt("URL obrázka", "https://");
  if (next === null) return;
  const src = next.trim();
  if (!src) return;
  editor.chain().focus().setImage({ src, alt: "" }).run();
}

function insertTable(editor: Editor) {
  editor
    .chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run();
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Čo si treba zapamätať…",
  disabled,
  id,
  className,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      TextStyle,
      Color,
      Underline,
      Subscript,
      Superscript,
      Typography,
      Image.configure({
        allowBase64: false,
        HTMLAttributes: { class: "note-image" },
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "note-link",
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        id: id ?? "note-body",
        class: cn(
          "note-editor-content min-h-[12rem] max-h-[24rem] overflow-y-auto px-3 py-2.5 text-[14px] leading-relaxed text-ink outline-none",
          "focus-visible:outline-none",
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.isEmpty ? "" : ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if ((value || "") === current) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  const off = disabled || !editor;
  const htmlLen = value?.length ?? 0;
  const plainLen = useMemo(() => noteBodyPlain(value).length, [value]);
  const overLimit = htmlLen > BODY_LIMIT;
  const activeColor =
    (editor?.getAttributes("textStyle").color as string | undefined) ?? "";
  const activeHighlight =
    (editor?.getAttributes("highlight").color as string | undefined) ?? "";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[4px] border border-border bg-ground transition-colors",
        "focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/15",
        overLimit && "border-negative focus-within:border-negative focus-within:ring-negative/20",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-raised/35 px-1.5 py-1">
        <ToolbarButton
          label="Tučné"
          active={editor?.isActive("bold")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Kurzíva"
          active={editor?.isActive("italic")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Podčiarknuté"
          active={editor?.isActive("underline")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Prečiarknuté"
          active={editor?.isActive("strike")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Horný index"
          active={editor?.isActive("superscript")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleSuperscript().run()}
        >
          <SuperscriptIcon className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Dolný index"
          active={editor?.isActive("subscript")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleSubscript().run()}
        >
          <SubscriptIcon className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Inline kód"
          active={editor?.isActive("code")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <Code className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Vymazať formátovanie"
          disabled={off}
          onClick={() =>
            editor?.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <RemoveFormatting className="size-3.5" strokeWidth={2} />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          label="Nadpis 1"
          active={editor?.isActive("heading", { level: 1 })}
          disabled={off}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Nadpis 2"
          active={editor?.isActive("heading", { level: 2 })}
          disabled={off}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Nadpis 3"
          active={editor?.isActive("heading", { level: 3 })}
          disabled={off}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Citácia"
          active={editor?.isActive("blockquote")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Blok kódu"
          active={editor?.isActive("codeBlock")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <SquareCode className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Oddeľovač"
          disabled={off}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-3.5" strokeWidth={2} />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          label="Odrážky"
          active={editor?.isActive("bulletList")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Číslovaný zoznam"
          active={editor?.isActive("orderedList")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Checklist"
          active={editor?.isActive("taskList")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
        >
          <ListTodo className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Tabuľka 3×3"
          active={editor?.isActive("table")}
          disabled={off}
          onClick={() => editor && insertTable(editor)}
        >
          <TableIcon className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        {editor?.isActive("table") ? (
          <>
            <ToolbarButton
              label="Pridať riadok"
              disabled={off}
              onClick={() => editor?.chain().focus().addRowAfter().run()}
            >
              <span className="text-[10px] font-semibold">+R</span>
            </ToolbarButton>
            <ToolbarButton
              label="Pridať stĺpec"
              disabled={off}
              onClick={() => editor?.chain().focus().addColumnAfter().run()}
            >
              <span className="text-[10px] font-semibold">+S</span>
            </ToolbarButton>
            <ToolbarButton
              label="Zmazať tabuľku"
              disabled={off}
              onClick={() => editor?.chain().focus().deleteTable().run()}
            >
              <Eraser className="size-3.5" strokeWidth={2} />
            </ToolbarButton>
          </>
        ) : null}

        <ToolbarSep />

        <ToolbarButton
          label="Zarovnať vľavo"
          active={editor?.isActive({ textAlign: "left" })}
          disabled={off}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Zarovnať na stred"
          active={editor?.isActive({ textAlign: "center" })}
          disabled={off}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Zarovnať vpravo"
          active={editor?.isActive({ textAlign: "right" })}
          disabled={off}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Zarovnať do bloku"
          active={editor?.isActive({ textAlign: "justify" })}
          disabled={off}
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="size-3.5" strokeWidth={2} />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          label="Odkaz"
          active={editor?.isActive("link")}
          disabled={off}
          onClick={() => editor && setLink(editor)}
        >
          <Link2 className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Odstrániť odkaz"
          disabled={off || !editor?.isActive("link")}
          onClick={() => editor?.chain().focus().unsetLink().run()}
        >
          <Unlink className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Obrázok z URL"
          disabled={off}
          onClick={() => editor && insertImage(editor)}
        >
          <ImageIcon className="size-3.5" strokeWidth={2} />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          label="Späť"
          disabled={off || !editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Znova"
          disabled={off || !editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-raised/20 px-2 py-1.5">
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Highlighter className="size-3" strokeWidth={2} aria-hidden />
          Zvýrazniť
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {HIGHLIGHT_COLORS.map((c) => (
            <ColorSwatch
              key={c.value}
              color={c.value}
              label={`Zvýraznenie · ${c.label}`}
              active={
                editor?.isActive("highlight") &&
                activeHighlight.toLowerCase() === c.value.toLowerCase()
              }
              disabled={off}
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleHighlight({ color: c.value })
                  .run()
              }
            />
          ))}
          <ToolbarButton
            label="Zrušiť zvýraznenie"
            disabled={off || !editor?.isActive("highlight")}
            onClick={() => editor?.chain().focus().unsetHighlight().run()}
          >
            <Eraser className="size-3.5" strokeWidth={2} />
          </ToolbarButton>
        </div>

        <ToolbarSep />

        <span className="text-[11px] text-muted-foreground">Farba textu</span>
        <div className="flex flex-wrap items-center gap-1">
          {TEXT_COLORS.map((c) => (
            <ColorSwatch
              key={c.label}
              color={c.value}
              label={`Farba · ${c.label}`}
              active={
                c.value
                  ? activeColor.toLowerCase() === c.value.toLowerCase()
                  : !activeColor
              }
              disabled={off}
              onClick={() => {
                if (!editor) return;
                if (!c.value) {
                  editor.chain().focus().unsetColor().run();
                  return;
                }
                editor.chain().focus().setColor(c.value).run();
              }}
            />
          ))}
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between gap-3 border-t border-border bg-raised/20 px-2.5 py-1 text-[11px] tabular-nums text-muted-foreground">
        <span>
          {plainLen} znakov
          {editor?.isActive("table") ? " · tabuľka" : null}
        </span>
        <span className={cn(overLimit && "font-medium text-negative")}>
          HTML {htmlLen}/{BODY_LIMIT}
        </span>
      </div>
    </div>
  );
}

/** Plain text from stored HTML/plain body for empty checks and previews. */
export function noteBodyPlain(html: string | null | undefined) {
  if (!html?.trim()) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isRichNoteBody(html: string | null | undefined) {
  return Boolean(html && /<\/?[a-z][\s\S]*>/i.test(html));
}
