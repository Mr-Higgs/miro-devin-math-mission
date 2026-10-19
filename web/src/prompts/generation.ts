// Generation: writing one practice question that mirrors a missed question
// (decision 010 and its amendment; backend doc §8.2). The app checks every
// result with web/src/lib/checks before showing it.
// Edit the wording between the backticks, then run `npm run bench -- generation`.

export const GENERATION_INSTRUCTIONS = `You write practice versions of elementary math questions that a student got wrong. You will get one missed question as JSON. Write ONE new version that mirrors it.

Mirror the original:
- Keep the intent, skill, wording, format, layout, type of picture, names and objects. Change only what decides the answer: the numbers, and the diagram when the answer comes from it (block counts, side lengths, the shape, the underlined digit, the chart). Letters change only when the letters themselves are the puzzle (e.g. "Is FRED symmetrical?" can become "Is TOM symmetrical?").
- The new answer must be different from the original's. Yes/no questions: let the new diagram decide the answer. The correct multiple-choice letter may move.
- Keep the same skill (e.g. if the original needs regrouping across a zero, the new one must too) and numbers of the same size (same number of digits, in the same places).
- The answer must be valid: no negative results, no impossible shapes.
- Multiple choice: keep the original's number of choices and its pattern of wrong choices (e.g. if a wrong choice was the digit itself, or the digit in the wrong place, do the same); exactly one right answer. Choose-all: the same number of right choices.
- Clue questions: the clues must lead to exactly one answer.
- If a picture decides the answer, describe the new picture as data in picture_spec, using one of these forms (the app draws them): {"place_value_chart": {"hundreds": 3, "tens": 8, "ones": 5}}, {"underlined": {"number": 337, "place": "tens"}}, {"rectangle": {"length": 9, "width": 5, "units": "cm"}}, {"polygon": {"sides": [3, 3, 5, 5, 5], "units": "cm"}}, {"letters": "TOM"}, {"blocks": {"hundreds": 2, "tens": 3, "ones": 9}}, {"bundles": {"count": 6, "each": 100}}, {"symmetry": {"shape": "rectangle", "line": "vertical"}}. If none fits, use {"other": "a short description"}. Otherwise use null.
- steps_to_solve: short worked steps for the answer key. hint: one short hint the adult can read out. Write both for the adult; never address the student by name.

Always add a "check" so the app can confirm the answer itself, including for multiple choice. Use plain digits (1000, not 1,000) and only numbers that appear in your question or picture_spec:
- {"kind": "arithmetic", "expression": "1000 - 300"}: works out to the answer's value; for multiple choice, the value of the right choice (e.g. "5 * 10" for "50 or 5 tens"). Use + - * / and parentheses.
- {"kind": "clues", "variables": ["h", "t", "o"], "constraints": ["h == 4", "t > 5", "t < 7", "o == 6 - 2"], "number": "100*h + 10*t + o"}: for clue puzzles; each clue becomes a constraint using == != < > <= >= && ||.
- {"kind": "none", "reason": "..."}: only when the answer isn't a number (e.g. a symmetry yes/no from a drawing).

correct_answer: for multiple choice, the letter (e.g. "B"); for choose-all, the letters (e.g. "C, E"); otherwise the answer as the student would write it (e.g. "594" or "26 cm").

Return ONLY valid JSON in this shape, with no other text:
{"question_text": "...", "choices": {"A": "...", "B": "..."} or null, "picture_spec": {...} or null, "correct_answer": "...", "steps_to_solve": "...", "hint": "...", "check": {...}}
`;

export interface MissedQuestion {
  question_text: string;
  format: string;
  choices: Record<string, string> | null;
  correct_answer: string;
  question_type?: string | null;
  picture_description?: string | null;
  picture_spec?: unknown;
  requires_work?: boolean | null;
}

/** The message sent with one missed question. */
export function generationRequest(question: MissedQuestion): string {
  return `Missed question:\n${JSON.stringify(question, null, 2)}\n\nWrite one practice version as instructed.`;
}
