import { listNotes } from "@/actions/notes";
import { PageHeader } from "@/components/layout/page-header";
import { NotesBoard } from "@/components/notes/notes-board";

export const metadata = { title: "Poznámky" };

export default async function NotesPage() {
  const data = await listNotes({ pageSize: 100 });
  const pinned = data.items.filter((n) => n.isPinned).length;

  return (
    <div>
      <PageHeader
        title="Poznámky"
        description="Rýchle zápisky mimo faktúr — pripnuté ostávajú navrchu."
        ledger={
          <>
            <span>{data.totalCount} poznámok</span>
            {pinned > 0 ? <span>{pinned} pripnutých</span> : null}
          </>
        }
      />
      <NotesBoard items={data.items} />
    </div>
  );
}
