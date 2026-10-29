"use client";

import { useEffect } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
        heading: { levels: [2, 3] },
        link: false,
        underline: false,
      }),
      Underline,
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
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
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
          "note-editor-content min-h-[11rem] max-h-[20rem] overflow-y-auto px-3 py-2.5 text-[14px] leading-relaxed text-ink outline-none",
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

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[4px] border border-border bg-ground transition-colors",
        "focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/15",
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
          label="Zvýraznenie"
          active={editor?.isActive("highlight")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="size-3.5" strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Inline kód"
          active={editor?.isActive("code")}
          disabled={off}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <Code className="size-3.5" strokeWidth={2} />
        </ToolbarButton>

        <ToolbarSep />

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
      <EditorContent editor={editor} />
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
