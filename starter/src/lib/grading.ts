// The four grading results. The AI returns one per question; the adult can
// override it on the review page.
export const GRADE_RESULTS = ["pass", "redo", "needs_check", "skipped"] as const;
export type GradeResult = (typeof GRADE_RESULTS)[number];
