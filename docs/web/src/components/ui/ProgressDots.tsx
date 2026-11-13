import type { GradeResult } from "@/lib/grading";
import { cx } from "./cx";

/** Each dot is a question: graded (its result), the current one, or not reached yet. */
export type DotState = GradeResult | "current" | "upcoming";

const dots: Record<DotState, string> = {
  pass: "bg-success",
  redo: "bg-danger",
  needs_check: "bg-warning",
  skipped: "bg-ink-muted",
  current: "bg-accent shadow-glow scale-125",
  upcoming: "bg-line",
};

const labels: Record<DotState, string> = {
  pass: "pass",
  redo: "redo",
  needs_check: "needs your check",
  skipped: "skipped",
  current: "current question",
  upcoming: "not reached yet",
};

export function ProgressDots({ states, className }: { states: DotState[]; className?: string }) {
  return (
    <ol className={cx("flex flex-wrap items-center gap-2", className)} aria-label="Progress through the questions">
      {states.map((state, i) => (
        <li
          key={i}
          aria-current={state === "current" ? "step" : undefined}
          className={cx("size-2.5 rounded-full transition-transform", dots[state])}
        >
          <span className="sr-only">
            Question {i + 1}: {labels[state]}
          </span>
        </li>
      ))}
    </ol>
  );
}
