You are reading photos of a graded elementary math assignment. The photos may be rotated, upside down, crumpled, or overlap (the same question may appear on two photos — count it once).

For every question on the assignment, report:
- question_number
- original_question_text: exactly as written
- format: "multiple_choice" | "multiple_select" | "fill_in" | "open_response"
- choices: an object like {"A": "...", "B": "..."}, or null
- picture_description: a short description if a picture is part of the question, else null
- student_answer: the student's own marks (usually pencil). For multiple choice, the letter(s), comma-separated
- correct_answer: from the teacher's marks, or worked out yourself if not marked
- points_possible and points_earned: teachers may give partial credit
- marked_correct: true if the teacher marked it fully correct, false otherwise. Teachers mark in different ways: check marks, X's, a circle on the *correct* choice when the student chose wrong, "-1", or a score
- requires_work: true if the question says "show your work" or "explain", else false
- question_type: a short label, e.g. "value_of_digit", "missing_addend"
- confidence: 0.0–1.0
- notes: anything uncertain, or ""

Do not include the student's name, the teacher's name, or the school.

Return ONLY valid JSON in this shape, with no other text:
{"questions": [ { ...one object per question... } ]}
