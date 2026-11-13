// Cross-checks on how the AI read a graded test. They run every time Step 2
// is shown (so they also reflect the adult's corrections) and point the adult
// at the questions most likely to be wrong. They never change anything.

export interface ReadQuestion {
  id: string;
  question_number: string;
  student_answer: string | null;
  correct_answer: string | null;
  points_possible: number | null;
  points_earned: number | null;
  marked_correct: boolean;
}

export interface ExtractionWarnings {
  /** About the test as a whole, e.g. the score doesn't add up. */
  overall: string[];
  /** Per question id. */
  byQuestion: Record<string, string[]>;
}

const norm = (s: string | null) => (s ?? "").toUpperCase().split("(")[0].replace(/[\s,$]/g, "").split("").sort().join("");

/** What the written score means in points: "8/10" -> 8; "55" on a 10-point test -> 5.5. */
export function scoreToPoints(asWritten: string | null, pointsPossible: number): number | null {
  if (!asWritten) return null;
  const fraction = /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/.exec(asWritten);
  if (fraction) return (Number(fraction[1]) / Number(fraction[2])) * pointsPossible;
  const n = /(\d+(?:\.\d+)?)/.exec(asWritten);
  if (!n) return null;
  const value = Number(n[1]);
  return asWritten.includes("%") || value > pointsPossible ? (value / 100) * pointsPossible : value;
}

export function checkExtraction(questions: ReadQuestion[], scoreAsWritten: string | null): ExtractionWarnings {
  const overall: string[] = [];
  const byQuestion: Record<string, string[]> = {};
  const flag = (q: ReadQuestion, message: string) => (byQuestion[q.id] ??= []).push(message);

  for (const q of questions) {
    if (!q.marked_correct && !q.student_answer) flag(q, "The student's answer wasn't found. Check the photo: it may be faint pencil.");
    if (q.student_answer && q.correct_answer) {
      const same = norm(q.student_answer) === norm(q.correct_answer);
      if (same && !q.marked_correct) flag(q, "The student's answer matches the correct answer, but it's marked missed.");
      if (!same && q.marked_correct) flag(q, "Marked correct, but the student's answer differs from the correct answer.");
    }
  }

  const possible = questions.reduce((n, q) => n + (q.points_possible ?? 1), 0);
  const earned = questions.reduce((n, q) => n + (q.points_earned ?? (q.marked_correct ? q.points_possible ?? 1 : 0)), 0);
  const fromPaper = scoreToPoints(scoreAsWritten, possible);
  if (fromPaper !== null && Math.abs(fromPaper - earned) > 0.01) {
    overall.push(
      `The score on the paper ("${scoreAsWritten}") works out to ${round(fromPaper)} of ${round(possible)} points, but the questions as read add up to ${round(earned)}. ` +
        `Check which questions are marked missed${questions.some((q) => byQuestion[q.id]) ? ", starting with the flagged ones" : ""}.`,
    );
  }
  return { overall, byQuestion };
}

const round = (n: number) => String(Math.round(n * 100) / 100);
