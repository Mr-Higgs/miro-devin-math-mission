import type { Metadata } from "next";
import { Suspense } from "react";
import { PrintedQuestion } from "../PrintedQuestion";
import { PrintFrame, isPracticeSet, loadForPrint, sheetTitle } from "../shared";

export const metadata: Metadata = { title: "Answer key" };

// The printable answer key for the adult (site map: print/answer-key): the
// practice sheet filled in (tutor's request 2026-10-20). Same layout, the right
// answers marked, and the worked steps in the work box.
export default function AnswerKeyPage({ params }: PageProps<"/sessions/[id]/print/answer-key">) {
  return <Suspense fallback={<p className="p-8">Loading…</p>}>{params.then(({ id }) => <AnswerKey id={id} />)}</Suspense>;
}

async function AnswerKey({ id }: { id: string }) {
  const loaded = await loadForPrint(id);
  if (!isPracticeSet(loaded)) return <div className="print-root p-8">{loaded}</div>;
  const s = loaded;

  return (
    <PrintFrame id={id} label="answer key" other={{ href: `/sessions/${id}/print/sheet`, label: "Open the practice sheet" }}>
      <header className="print-header">
        <span className="print-title">Answer key · {sheetTitle(s)}</span>
        <div className="print-fields">
          <span>Name: <span className="line">{s.assignment.student_nickname}</span></span>
          <span>For the adult</span>
        </div>
      </header>

      {s.practice.map((p) => (
        <PrintedQuestion key={p.id} p={p} answers />
      ))}
      <p className="print-footer">Answer key · for the adult</p>
    </PrintFrame>
  );
}
