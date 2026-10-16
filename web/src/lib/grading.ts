// The four grading results (decision 003). The AI returns one per question;
// the adult can override it.
export const GRADE_RESULTS = ["pass", "redo", "needs_check", "skipped"] as const;
export type GradeResult = (typeof GRADE_RESULTS)[number];
