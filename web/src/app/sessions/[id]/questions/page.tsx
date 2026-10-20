import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Card, Notice, PageShell, QuestionCard } from "@/components/ui";
import { SignOutButton } from "@/components/SignOutButton";
import { requireAdult } from "@/lib/auth";
import { checkExtraction } from "@/lib/checks/extraction";
import { getSession } from "@/lib/sessions";
import { QuestionControls } from "./QuestionControls";
import { ReadingTest } from "./ReadingTest";

export const metadata: Metadata = { title: "Missed questions" };

// Step 2 of a session (site map): the app reads the test, then lists the
// missed questions. Editing, removing and adding questions come next.
export default function QuestionsPage({ params }: PageProps<"/sessions/[id]/questions">) {
  return (
    <Suspense
      fallback={
        <PageShell title="Missed questions" actions={<SignOutButton />}>
          <p className="text-ink-muted">Loading…</p>
        </PageShell>
      }
    >
      {params.then(({ id }) => <Questions id={id} />)}
    </Suspense>
  );
}

async function Questions({ id }: { id: string }) {
  await requireAdult();
  const session = await getSession(id);
  if (!session) notFound();
  const { assignment } = session;
  const done = assignment.extraction_status === "done";
  const missed = assignment.questions.filter((q) => !q.marked_correct);
  const correct = assignment.questions.filter((q) => q.marked_correct);
  const warnings = checkExtraction(assignment.questions, assignment.scoreAsWritten);
  const card = (q: (typeof assignment.questions)[number]) => (
    <QuestionCard
      key={q.id}
      q={q}
      warnings={warnings.byQuestion[q.id]}
      actions={
        <QuestionControls
          questionId={q.id}
          markedCorrect={q.marked_correct}
          studentAnswer={q.student_answer}
          correctAnswer={q.correct_answer}
        />
      }
    />
  );

  return (
    <PageShell
      title={`${assignment.student_nickname}${assignment.assignment_name ? `: ${assignment.assignment_name}` : ""}`}
      intro="Step 2 of 7: review the missed questions."
      actions={<SignOutButton />}
    >
      <div className="grid gap-6">
        {!done ? (
          <ReadingTest sessionId={session.id} status={assignment.extraction_status} error={assignment.extraction_error} />
        ) : (
          <>
            <Notice tone={missed.length ? "info" : "success"} title={`${missed.length} missed out of ${assignment.questions.length} questions`}>
              {assignment.notes && <p>{assignment.notes}</p>}
              <p>
                Check each question against the paper. Tap &quot;Mark as correct&quot; or &quot;Mark as missed&quot; to fix
                one, or &quot;Edit answers&quot;.
                {assignment.scoreAsWritten && ` Score on the paper: ${assignment.scoreAsWritten}.`}
              </p>
            </Notice>
            {warnings.overall.map((w) => (
              <Notice key={w} tone="warning" title="Something doesn't add up">
                {w}
              </Notice>
            ))}

            <Card title="Missed questions">
              {missed.length ? (
                <div className="grid gap-3">
                  {missed.map(card)}
                </div>
              ) : (
                <p className="text-ink-muted">No missed questions were found.</p>
              )}
            </Card>

            {correct.length > 0 && (
              <details className="rounded-card border border-line bg-surface p-5">
                <summary className="cursor-pointer font-display font-semibold text-ink">
                  Questions marked correct ({correct.length})
                </summary>
                <div className="mt-4 grid gap-3">
                  {correct.map(card)}
                </div>
              </details>
            )}
          </>
        )}

        <Card title="Pages" aside={done ? "Turned upright automatically" : undefined}>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {assignment.pages.map((p) => (
              <li key={p.page_order} className="overflow-hidden rounded-control border border-line bg-surface-muted">
                {p.url ? (
                  // Private photos behind short-lived signed links, so not next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.url}
                    alt={`Page ${p.page_order}`}
                    className="aspect-square w-full object-contain transition-transform"
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-sm text-ink-muted">Photo deleted</div>
                )}
                <p className="px-2 py-1 text-xs text-ink-muted">Page {p.page_order}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
