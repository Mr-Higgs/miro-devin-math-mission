import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge, Button, ButtonLink, Card, GradeBadge, Notice, PageShell } from "@/components/ui";
import { SpecPicture } from "@/components/SpecPicture";
import { getPractice } from "@/lib/sessions";
import { workPageUrl } from "@/lib/store";
import { GradingWork } from "./GradingWork";
import { OverrideButtons } from "./OverrideButtons";
import { completeSession } from "./actions";

export const metadata: Metadata = { title: "Review" };

// Step 5 of a session: the graded work, one card per practice question, with
// one-tap overrides.
export default function ReviewPage({ params }: PageProps<"/sessions/[id]/review">) {
  return (
    <Suspense
      fallback={
        <PageShell title="Review">
          <p className="text-ink-muted">Loading…</p>
        </PageShell>
      }
    >
      {params.then(({ id }) => <Review id={id} />)}
    </Suspense>
  );
}

async function Review({ id }: { id: string }) {
  const session = await getPractice(id);
  if (!session) notFound();
  if (session.practice_status !== "ready") redirect(`/sessions/${id}/practice`);
  if (!session.work.page_count) redirect(`/sessions/${id}/work`);

  const done = session.work.grading_status === "done";
  const passed = session.practice.filter((p) => p.grade?.result === "pass").length;
  const redo = session.practice.filter((p) => p.grade?.result === "redo").length;
  const check = session.practice.filter((p) => p.grade?.result === "needs_check").length;
  const skipped = session.practice.filter((p) => p.grade?.result === "skipped").length;

  return (
    <PageShell
      title={`${session.assignment.student_nickname}${session.assignment.assignment_name ? `: ${session.assignment.assignment_name}` : ""}`}
      intro="Step 5 of 5: review how the work was graded. Override anything the app read wrong."
    >
      <div className="grid gap-6">
        <div>
          <ButtonLink href={`/sessions/${id}/practice`} variant="quiet">
            ← Back to the practice set
          </ButtonLink>
        </div>

        {!done ? (
          <GradingWork sessionId={id} status={session.work.grading_status} error={session.work.grading_error} />
        ) : (
          <>
            <Notice tone={redo || check ? "warning" : "success"} title={`${passed} passed · ${redo} to redo · ${check} need your check${skipped ? ` · ${skipped} skipped` : ""}`}>
              Tap Pass / Redo / Needs check on any question to change the grade.
            </Notice>

            <div className="grid gap-4">
              {session.practice.map((p) => (
                <Card key={p.id} title={`Practice ${p.position}`}>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {p.grade ? (
                      <>
                        <GradeBadge result={p.grade.result} />
                        {p.grade.overridden && <Badge tone="accent">Overridden</Badge>}
                      </>
                    ) : (
                      <Badge tone="warning">Not graded</Badge>
                    )}
                  </div>
                  <p className="text-ink">{p.question_text}</p>
                  {p.picture_spec && (
                    <div className="mt-3">
                      <SpecPicture spec={p.picture_spec} />
                    </div>
                  )}
                  <dl className="mt-3 grid gap-1 text-sm">
                    <div>
                      <dt className="inline text-ink-muted">Correct answer: </dt>
                      <dd className="inline">{p.correct_answer}</dd>
                    </div>
                    <div>
                      <dt className="inline text-ink-muted">Student&apos;s answer as read: </dt>
                      <dd className="inline">{p.grade?.student_answer_read ?? "(not found)"}</dd>
                    </div>
                    {p.grade?.work_shown !== null && p.grade && (
                      <div>
                        <dt className="inline text-ink-muted">Work shown: </dt>
                        <dd className="inline">{p.grade.work_shown ? "yes" : "no"}</dd>
                      </div>
                    )}
                    {p.grade?.feedback && (
                      <div>
                        <dt className="inline text-ink-muted">Feedback: </dt>
                        <dd className="inline">{p.grade.feedback}</dd>
                      </div>
                    )}
                  </dl>
                  {p.hint && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-ink-muted">Show hint</summary>
                      <p className="mt-1 text-sm">{p.hint}</p>
                    </details>
                  )}
                  <OverrideButtons sessionId={id} generatedId={p.id} current={p.grade?.result ?? "needs_check"} />
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <form action={completeSession.bind(null, id)}>
                <Button type="submit" size="lg">
                  Complete session
                </Button>
              </form>
            </div>
          </>
        )}

        <Card title="Uploaded work">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: session.work.page_count }, (_, i) => (
              <li key={i + 1} className="overflow-hidden rounded-control border border-line bg-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={workPageUrl(id, i + 1)} alt={`Work page ${i + 1}`} className="aspect-square w-full object-contain" />
                <p className="px-2 py-1 text-xs text-ink-muted">Page {i + 1}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
