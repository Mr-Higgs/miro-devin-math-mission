import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge, Button, Card, PageShell } from "@/components/ui";
import { mission } from "@mission";
import { getSession } from "@/lib/store";
import { features } from "@/features";
import { FlashcardInput } from "./FlashcardInput";
import { StartingPractice } from "./StartingPractice";
import { submitAnswers } from "./actions";

export const metadata: Metadata = { title: "Practice" };

// Screen 3 of 4: the AI-written practice set. The learner answers right here.
export default function PracticePage({ params }: PageProps<"/sessions/[id]/practice">) {
  return (
    <Suspense
      fallback={
        <PageShell title="Practice">
          <p className="text-ink-muted">Loading…</p>
        </PageShell>
      }
    >
      {params.then(({ id }) => <Practice id={id} />)}
    </Suspense>
  );
}

async function Practice({ id }: { id: string }) {
  const session = await getSession(id);
  if (!session) notFound();
  if (session.material.status !== "ready") redirect(`/sessions/${id}/material`);
  const { practice } = session;
  const ready = practice.status === "ready";
  const flagged = practice.questions.filter((q) => q.check_status === "flagged");
  const practiceFeatures = features.filter((f) => f.Practice);

  return (
    <PageShell title={session.material.title || "Practice"} intro="Step 3 of 4: answer each question — your try is what counts.">
      {!ready ? (
        <StartingPractice sessionId={id} status={practice.status} error={practice.error} count={mission.practice.count} />
      ) : (
        <form action={submitAnswers.bind(null, id)} className="grid gap-6">
          <div className="grid gap-4">
            {practice.questions.map((q) => {
              const name = `q_${q.id}`;
              return (
                <fieldset key={q.id} data-question-type={q.type} className="card rounded-card border border-line bg-surface p-5 sm:p-6">
                  <legend className="sr-only">Question {q.position}</legend>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="font-display font-semibold text-ink">Question {q.position}</span>
                    {q.check_status === "flagged" && <Badge tone="warning">Needs a look</Badge>}
                  </div>
                  <p className="text-ink">{q.prompt}</p>

                  {q.type === "multiple_choice" && q.choices && (
                    <div className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                      {Object.entries(q.choices).map(([letter, text]) => (
                        <label key={letter} className="flex items-center gap-2 rounded-control border border-line px-3 py-1.5 text-ink has-checked:border-accent has-checked:bg-accent-soft">
                          <input type="radio" name={name} value={letter} required className="accent-accent" />
                          <span>
                            <span className="font-semibold">{letter}.</span> {text}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === "fill_in" && (
                    <input
                      name={name}
                      required
                      autoComplete="off"
                      placeholder="Your answer"
                      className="mt-3 h-11 max-w-xs rounded-control border border-line bg-surface px-3 text-ink placeholder:text-ink-muted focus:border-accent"
                    />
                  )}
                  {(q.type === "short_answer" || q.type === "scenario") && (
                    <textarea
                      name={name}
                      required
                      rows={3}
                      placeholder="Your answer"
                      className="mt-3 w-full rounded-control border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-accent"
                    />
                  )}
                  {q.type === "flashcard" && <FlashcardInput name={name} answer={q.answer} />}

                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    {q.hint && (
                      <details className="text-sm">
                        <summary className="cursor-pointer font-medium text-accent">Show hint</summary>
                        <p className="mt-1 text-ink-muted">{q.hint}</p>
                      </details>
                    )}
                    {practiceFeatures.map((f) => (
                      <f.Practice key={f.id} question={q} />
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>

          {flagged.length > 0 && (
            <p className="text-sm text-ink-muted">
              {flagged.length} question{flagged.length === 1 ? "" : "s"} marked &quot;Needs a look&quot; — the app
              couldn&apos;t check {flagged.length === 1 ? "it" : "them"}, so an adult may want to glance at{" "}
              {flagged.length === 1 ? "it" : "them"} later.
            </p>
          )}

          <div>
            <Button type="submit" size="lg" data-step="submit-answers">
              How did I do?
            </Button>
          </div>
        </form>
      )}
    </PageShell>
  );
}
