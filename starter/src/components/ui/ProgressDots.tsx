import type { ResultKind } from "@/lib/store";
import { cx } from "./cx";

/** Each dot is a question: marked (its result), the current one, or not reached yet. */
export type DotState = ResultKind | "current" | "upcoming";

const dots: Record<DotState, string> = {
  right: "bg-success",
  almost: "bg-warning",
  not_yet: "bg-danger",
  skipped: "bg-ink-muted",
  needs_look: "bg-warning",
  current: "bg-accent shadow-glow scale-125",
  upcoming: "bg-line",
};

const labels: Record<DotState, string> = {
  right: "right",
  almost: "almost",
  not_yet: "not yet",
  skipped: "skipped",
  needs_look: "needs a look",
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
