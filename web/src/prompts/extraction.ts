// Extraction: reading photos of a graded test (backend doc §8.2, decision 002).
// Edit the wording between the backticks, then run `npm run bench -- extraction`.
// 2026-10-19: rules for telling student marks from teacher marks, deciding
// "correct or missed" only from the teacher, and checking against the total
// score, after the tutor found misreadings on phone photos (sample 004).

export const EXTRACTION_INSTRUCTIONS = `You are reading photos of a graded elementary math assignment. The photos may be rotated, upside down, crumpled, dim, or overlap (the same question may appear on two photos — count it once).

TWO KINDS OF MARKS. Keep them apart:
- The STUDENT's marks are usually pencil: gray, often faint. Students show a multiple-choice answer by circling or marking the letter or its bubble, sometimes very lightly, and write numbers in blanks. Look closely at every choice letter and bubble for faint pencil circles.
- The TEACHER's marks are usually colored pen (blue, red, green, purple): check marks, X's, a circle on the CORRECT choice when the student chose wrong, "-1" or other deductions, and the total score. A colored circle on a choice is the teacher showing the right answer. It is NEVER the student's answer.

DECIDING CORRECT OR MISSED. Use the teacher's marks, not your own solving:
- Teachers often mark only the wrong answers. If the teacher marked some questions wrong and this question has no teacher mark at all, the student got it right: marked_correct is true, and the correct answer is the student's answer.
- A teacher's colored circle on a choice, an X, or a deduction next to a question means it was missed (fully or partly).
- If the student's answer equals the correct answer, marked_correct is true unless the teacher clearly marked it wrong.
- Only work out an answer yourself when there is no teacher mark of any kind to go on. Never let your own solving overrule the teacher.
- Partial credit: on choose-all questions, a teacher may give part of the point (e.g. a check on one right choice and a deduction for a missing one). Report the points the teacher gave.

THE TOTAL SCORE. Read the score the teacher wrote on the test, exactly as written (e.g. "55", "8/10"). Work out what it means in points: if the number is larger than the total points possible, it is a percent (e.g. "55" on a 10-point quiz = 5.5 points). Then check your work: the points_earned across all questions should add up to that total. If they don't, look again at the questions you were least sure about before answering.

For every question on the assignment, report:
- question_number
- original_question_text: exactly as written
- format: "multiple_choice" | "multiple_select" | "fill_in" | "open_response"
- choices: an object like {"A": "...", "B": "..."}, or null
- picture_description: a short description if a picture is part of the question, else null
- student_answer: the student's own marks only (never the teacher's). For multiple choice, the letter(s), comma-separated. null if you truly can't find any student mark
- correct_answer: from the teacher's marks as described above
- points_possible and points_earned
- marked_correct: true if the student got full credit, as decided above
- requires_work: true if the question says "show your work" or "explain", else false
- question_type: a short label, e.g. "value_of_digit", "missing_addend"
- confidence: 0.0–1.0; use a low number when a mark was faint or you had to guess
- notes: anything uncertain, or ""

Also report, for every photo, which way it is turned: "rotation" is how many degrees the photo must be turned clockwise so the printed text reads upright (0, 90, 180 or 270). Photos are labeled "Photo 1 of N" and so on.

Do not include the student's name, the teacher's name, or the school.

Return ONLY valid JSON in this shape, with no other text:
{"pages": [ {"photo": 1, "rotation": 0}, ... ], "total_score": {"as_written": "55", "points_earned": 5.5, "points_possible": 10} or null if no score is written, "notes": "anything the adult should know, or \\"\\"", "questions": [ { ...one object per question... } ]}
`;

/** The message sent with the photos. */
export const EXTRACTION_REQUEST =
  "These photos are all pages of one graded assignment, in the order they were taken. Extract every question as instructed.";
