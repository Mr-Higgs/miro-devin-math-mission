import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge, ButtonLink, Card, Notice, PageShell, cx } from "@/components/ui";
import { SignOutButton } from "@/components/SignOutButton";
import { requireAdult } from "@/lib/auth";
import { getPractice } from "@/lib/sessions";
import { Picture } from "@/components/pictures/Picture";
import { RegenerateButton } from "./RegenerateButton";
import { RewriteButton } from "./RewriteButton";
import { WritingPractice } from "./WritingPractice";

export const metadata: Metadata = { title: "Practice set" };

// Step 3 of a session (site map): one practice question per missed question,
// checked by the app (decision 010). Print pages come next.
export default function PracticePage({ params }: PageProps<"/sessions/[id]/practice">) {
  return (
    <Suspense
      fallback={
        <PageShell title="Practice set" actions={<SignOutButton />}>
          <p className="text-ink-muted">Loading…</p>
        </PageShell>
      }
    >
      {params.then(({ id }) => <Practice id={id} />)}
    </Suspense>
  );
}

const letters = (answer: string | null) => new Set(answer?.split("(")[0].match(/\b[A-Z]\b/g) ?? []);

async function Practice({ id }: { id: string }) {
  await requireAdult();
  const session = await getPractice(id);
  if (!session) notFound();
  if (session.assignment.extraction_status !== "done") redirect(`/sessions/${id}/questions`);
  const { assignment, practice } = session;
  const ready = session.practice_status === "ready";
  const flagged = practice.filter((p) => p.check_status === "flagged");

  return (
    <PageShell
      title={`${assignment.student_nickname}${assignment.assignment_name ? `: ${assignment.assignment_name}` : ""}`}
      intro="Step 3 of 7: the practice set. One new question for each missed question, in the same order."
      actions={<SignOutButton />}
    >
      <div className="grid gap-6">
        <div>
          <ButtonLink href={`/sessions/${id}/questions`} variant="quiet">
            ← Back to missed questions
          </ButtonLink>
        </div>

        {!ready ? (
          <WritingPractice sessionId={id} status={session.practice_status} error={session.practice_error} count={session.missedCount} />
        ) : practice.length === 0 ? (
          <Notice tone="success" title="Nothing to practice">
            No questions are marked missed, so there&apos;s no practice set to write.
          </Notice>
        ) : (
          <>
            <Notice tone={flagged.length ? "warning" : "success"} title={`${practice.length} practice questions`}>
              {flagged.length
                ? `${flagged.length} need${flagged.length === 1 ? "s" : ""} your check: the app couldn't confirm the math. Regenerate ${flagged.length === 1 ? "it" : "them"}, or check by hand.`
                : "Every question passed the app's math checks. Regenerate any you'd like different numbers for."}
            </Notice>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={`/sessions/${id}/print/sheet`} size="lg" target="_blank">
                Print practice sheet
              </ButtonLink>
              <ButtonLink href={`/sessions/${id}/print/answer-key`} size="lg" variant="secondary" target="_blank">
                Print answer key
              </ButtonLink>
            </div>

            {practice.length !== session.missedCount && (
              <Notice tone="warning" title="The missed questions have changed">
                Step 2 now has {session.missedCount} missed questions, but this practice set has {practice.length}.
                <div>
                  <RewriteButton sessionId={id} />
                </div>
              </Notice>
            )}

            <div className="grid gap-4">
              {practice.map((p) => {
                const right = letters(p.correct_answer);
                return (
                  <Card
                    key={p.id}
                    title={`Practice ${p.position}`}
                    aside={p.original ? `From question ${p.original.question_number}` : undefined}
                  >
                    <div className="mb-3 flex flex-wrap gap-2">
                      {p.check_status === "passed" ? <Badge tone="success">Math checked</Badge> : <Badge tone="warning">Needs your check</Badge>}
                      {p.requires_work && <Badge tone="accent">Work required</Badge>}
                    </div>
                    {p.check_status !== "passed" && p.check_notes && (
                      <p className="mb-3 rounded-control bg-warning-soft px-3 py-2 text-sm text-ink">{p.check_notes}</p>
                    )}
                    <p className="text-ink">{p.question_text}</p>
                    {p.picture_spec && (
                      <div className="mt-3">
                        <Picture spec={p.picture_spec as Record<string, unknown>} />
                      </div>
                    )}
                    {p.choices ? (
                      <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                        {Object.entries(p.choices).map(([letter, text]) => (
                          <li key={letter} className={cx("rounded-control border px-3 py-1.5", right.has(letter) ? "border-success bg-success-soft" : "border-line")}>
                            <span className="font-semibold">{letter}.</span> {text}
                            {right.has(letter) && <span className="text-ink-muted"> · answer</span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm">
                        <span className="text-ink-muted">Answer:</span> {p.correct_answer}
                      </p>
                    )}
                    <dl className="mt-3 grid gap-1 text-sm">
                      {p.steps_to_solve && (
                        <div>
                          <dt className="inline text-ink-muted">Steps: </dt>
                          <dd className="inline">{p.steps_to_solve}</dd>
                        </div>
                      )}
                      {p.hint && (
                        <div>
                          <dt className="inline text-ink-muted">Hint: </dt>
                          <dd className="inline">{p.hint}</dd>
                        </div>
                      )}
                      {p.original && (
                        <div className="text-ink-muted">
                          <dt className="inline">Original: </dt>
                          <dd className="inline">{p.original.original_question_text}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <RegenerateButton id={p.id} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
