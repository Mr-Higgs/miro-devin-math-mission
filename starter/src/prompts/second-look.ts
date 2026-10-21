// Second look: when the main reading couldn't find a student's answer, the app
// sends just that question's photo back with this short, focused request
// (2026-10-20, after a faint pencil "D" went unread in the first live test).
// Edit the wording between the backticks, then run `npm run bench -- extraction`.

export const SECOND_LOOK_INSTRUCTIONS = `You are looking again at ONE photo of a graded elementary math assignment, to find the STUDENT's answers to specific questions that were hard to read the first time. The photo may be upside down, rotated or dim.

- The student's marks are pencil: gray, often very faint. For multiple choice, the student circles or marks the choice letter or its bubble, sometimes very lightly. Look closely at every choice of each listed question. For other questions, the student writes the answer in pencil.
- The teacher's marks are colored pen (blue, red, green, purple): a colored circle on a choice is the teacher showing the correct answer. It is NEVER the student's answer.

For each listed question, report the student's answer: for multiple choice the letter(s) the student marked in pencil, comma-separated; otherwise exactly what the student wrote. Use null only if there is truly no student mark at all.

Do not include any names.

Return ONLY valid JSON in this shape, with no other text:
{"answers": [ {"question_number": "10", "student_answer": "D" or null, "confidence": 0.0-1.0} ]}
`;

export interface SecondLookQuestion {
  question_number: string;
  original_question_text: string;
  choices: Record<string, string> | null;
}

/** The message sent with the photo. */
export function secondLookRequest(questions: SecondLookQuestion[]): string {
  return `Find the student's answer to these questions on this photo:\n${JSON.stringify(questions, null, 2)}`;
}
