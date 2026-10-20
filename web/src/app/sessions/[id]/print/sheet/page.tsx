import type { Metadata } from "next";
import { Suspense } from "react";
import { PrintedQuestion } from "../PrintedQuestion";
import { PrintFrame, isPracticeSet, loadForPrint, sheetTitle } from "../shared";

export const metadata: Metadata = { title: "Practice sheet" };

// The printable practice sheet for the student (site map: print/sheet).
// A plain school worksheet: no answers, space to work, the student's nickname.
export default function SheetPage({ params }: PageProps<"/sessions/[id]/print/sheet">) {
  return <Suspense fallback={<p className="p-8">Loading…</p>}>{params.then(({ id }) => <Sheet id={id} />)}</Suspense>;
}

async function Sheet({ id }: { id: string }) {
  const loaded = await loadForPrint(id);
  if (!isPracticeSet(loaded)) return <div className="print-root p-8">{loaded}</div>;
  const s = loaded;
  const flagged = s.practice.filter((p) => p.check_status !== "passed").length;

  return (
    <PrintFrame id={id} label="practice sheet" other={{ href: `/sessions/${id}/print/answer-key`, label: "Open the answer key" }}>
      {flagged > 0 && (
        <p className="print-toolbar warn">
          {flagged} question{flagged === 1 ? "" : "s"} still need{flagged === 1 ? "s" : ""} your check on the practice page before printing.
        </p>
      )}
      <header className="print-header">
        <span className="print-title">{sheetTitle(s)}</span>
        <div className="print-fields">
          <span>Name: <span className="line">{s.assignment.student_nickname}</span></span>
          <span>Date: <span className="line" /></span>
        </div>
      </header>

      {s.practice.map((p) => (
        <PrintedQuestion key={p.id} p={p} />
      ))}
      <p className="print-footer">Practice sheet · {s.practice.length} questions</p>
    </PrintFrame>
  );
}
