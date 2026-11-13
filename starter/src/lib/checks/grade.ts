// Grading the app can do itself (screen 4): multiple choice letters, exact
// fill-in matches, and flashcards (self-marked). Everything else goes to the
// AI. Pure functions; no server-only or path aliases.
import type { QuestionType } from "../../../mission.config";

export interface GradeableQuestion {
  type: QuestionType;
  choices: Record<string, string> | null;
  answer: string;
}

export type AppResult = "right" | "almost" | "not_yet" | "skipped" | "needs_look";

/** Folds an answer down for comparison: case, accents, spaces, trailing punctuation. */
export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?,;:'"]+$/g, "");
}

/**
 * What the app can mark without the AI, or null when the AI must look.
 * - multiple_choice: the letter must match.
 * - fill_in: an exact match after normalizing is "right"; anything else is
 *   close enough to be worth the AI's judgment.
 * - flashcard: self-marked ("knew" / "not_yet").
 * Empty answers are "skipped".
 */
export function gradeByApp(
  question: GradeableQuestion,
  answer: string,
): { result: AppResult; graded_by: "app" | "self" } | null {
  const trimmed = answer.trim();
  if (!trimmed) return { result: "skipped", graded_by: "app" };

  switch (question.type) {
    case "multiple_choice":
      return { result: trimmed.toUpperCase() === question.answer.trim().toUpperCase() ? "right" : "not_yet", graded_by: "app" };
    case "fill_in":
      if (normalizeAnswer(trimmed) === normalizeAnswer(question.answer)) {
        return { result: "right", graded_by: "app" };
      }
      return null; // close but not exact — let the AI judge
    case "flashcard":
      return { result: trimmed === "knew" ? "right" : "not_yet", graded_by: "self" };
    default:
      return null;
  }
}
