import type { ReactNode } from "react";
import { Badge } from "./Badge";
import { cx } from "./cx";

export interface QuestionCardData {
  question_number: string;
  original_question_text: string;
  choices: Record<string, string> | null;
  picture_description: string | null;
  student_answer: string | null;
  correct_answer: string | null;
  points_possible: number | null;
  points_earned: number | null;
  marked_correct: boolean;
  requires_work: boolean;
  confidence: number | null;
}

/** Below this, the AI wasn't sure it read the question right: worth a look. */
const LOW_CONFIDENCE = 0.7;

const letters = (answer: string | null) => new Set((answer?.split("(")[0].match(/\b[A-Z]\b/g) ?? []));

/** One question from the original test, as the AI read it. */
export function QuestionCard({ q, actions, warnings = [] }: { q: QuestionCardData; actions?: ReactNode; warnings?: string[] }) {
  const partial = q.points_earned !== null && q.points_possible !== null && q.points_earned > 0 && q.points_earned < q.points_possible;
  const studentPicked = letters(q.student_answer);
  const right = letters(q.correct_answer);

  return (
    <article className="rounded-card border border-line bg-surface p-4">
      <header className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-display font-semibold text-ink">Question {q.question_number}</span>
        {q.marked_correct ? <Badge tone="success">Marked correct</Badge> : <Badge tone="danger">Missed</Badge>}
        {partial && <Badge tone="warning">Partial credit</Badge>}
        {q.requires_work && <Badge tone="accent">Work required</Badge>}
        {(warnings.length > 0 || (q.confidence !== null && q.confidence < LOW_CONFIDENCE)) && <Badge tone="warning">Check this one</Badge>}
      </header>
      {warnings.length > 0 && (
        <ul className="mb-2 rounded-control bg-warning-soft px-3 py-2 text-sm text-ink">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      <p className="text-ink">{q.original_question_text}</p>
      {q.picture_description && <p className="mt-1 text-sm text-ink-muted">Picture: {q.picture_description}</p>}

      {q.choices ? (
        <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
          {Object.entries(q.choices).map(([letter, text]) => (
            <li
              key={letter}
              className={cx(
                "rounded-control border px-3 py-1.5",
                right.has(letter) ? "border-success bg-success-soft" : studentPicked.has(letter) ? "border-danger bg-danger-soft" : "border-line",
              )}
            >
              <span className="font-semibold">{letter}.</span> {text}
              {studentPicked.has(letter) && <span className="text-ink-muted"> · student&apos;s answer</span>}
              {right.has(letter) && <span className="text-ink-muted"> · correct</span>}
            </li>
          ))}
        </ul>
      ) : (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-ink-muted">Student&apos;s answer</dt>
          <dd className="text-ink">{q.student_answer ?? "(blank or unreadable)"}</dd>
          <dt className="text-ink-muted">Correct answer</dt>
          <dd className="text-ink">{q.correct_answer ?? "(not found)"}</dd>
        </dl>
      )}
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </article>
  );
}
