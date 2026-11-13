import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Button, ButtonLink, Card, Notice, PageShell, ProgressDots, ResultBadge } from "@/components/ui";
import { getSession } from "@/lib/store";
import { features } from "@/features";
import { EvaluatingAnswers } from "./EvaluatingAnswers";
import { tryNewSet } from "./actions";

export const metadata: Metadata = { title: "How did I do" };

// Screen 4 of 4: how each answer went, an overall summary, and what to
// practice next.
export default function ResultsPage({ params }: PageProps<"/sessions/[id]/results">) {
  return (
    <Suspense
      fallback={
        <PageShell title="How did I do">
          <p className="text-ink-muted">Loading…</p>
        </PageShell>
      }
    >
      {params.then(({ id }) => <Results id={id} />)}
    </Suspense>
  );
}

async function Results({ id }: { id: string }) {
  const session = await getSession(id);
  if (!session) notFound();
  if (session.practice.status !== "ready") redirect(`/sessions/${id}/practice`);
  const { results } = session;
  const ready = results.status === "ready";
  const questions = [...session.practice.questions].sort((a, b) => a.position - b.position);
  const byId = new Map(results.items.map((i) => [i.question_id, i]));
  const resultsFeatures = features.filter((f) => f.Results);

  return (
    <PageShell title="How did I do" intro={`Step 4 of 4: ${session.material.title || "your practice set"}.`}>
      {!ready ? (
        <EvaluatingAnswers sessionId={id} status={results.status} error={results.error} />
      ) : (
        <div className="grid gap-6">
          <Card>
            <div className="grid gap-4" data-step="results-summary">
              <ProgressDots states={questions.map((q) => byId.get(q.id)?.result ?? "upcoming")} />
              {results.summary && <p className="text-lg text-ink">{results.summary}</p>}
            </div>
          </Card>

          {resultsFeatures.map((f) => (
            <f.Results key={f.id} session={session} />
          ))}

          <div className="grid gap-4">
            {questions.map((q) => {
              const item = byId.get(q.id);
              return (
                <Card key={q.id} title={`Question ${q.position}`} aside={item ? <ResultBadge result={item.result} /> : undefined}>
                  <p className="text-ink">{q.prompt}</p>
                  {q.choices && (
                    <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                      {Object.entries(q.choices).map(([letter, text]) => (
                        <li key={letter} className="rounded-control border border-line px-3 py-1.5">
                          <span className="font-semibold">{letter}.</span> {text}
                        </li>
                      ))}
                    </ul>
                  )}
                  <dl className="mt-3 grid gap-1 text-sm">
                    <div>
                      <dt className="inline text-ink-muted">Your answer: </dt>
                      <dd className="inline text-ink">{item?.learner_answer?.trim() || "(no answer)"}</dd>
                    </div>
                    <div>
                      <dt className="inline text-ink-muted">Answer: </dt>
                      <dd className="inline text-ink">{q.type === "multiple_choice" && q.choices ? `${q.answer}. ${q.choices[q.answer]}` : q.answer}</dd>
                    </div>
                    {item?.feedback && (
                      <div>
                        <dt className="inline text-ink-muted">Feedback: </dt>
                        <dd className="inline text-ink">{item.feedback}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="inline text-ink-muted">Why: </dt>
                      <dd className="inline text-ink">{q.explanation}</dd>
                    </div>
                  </dl>
                </Card>
              );
            })}
          </div>

          {results.next_steps.length > 0 && (
            <Notice title="Practice next">
              <ul className="list-inside list-disc">
                {results.next_steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Notice>
          )}

          <div className="flex flex-wrap gap-3">
            <form action={tryNewSet.bind(null, id)}>
              <Button type="submit" size="lg">
                Try a new set on this material
              </Button>
            </form>
            <ButtonLink href="/sessions/new" size="lg" variant="secondary">
              Start a new session
            </ButtonLink>
          </div>
        </div>
      )}
    </PageShell>
  );
}
