// "AI writes, code checks": every AI reply is validated here before it's
// shown. Pure functions only — no server-only, no @/ or @mission value
// imports — because `npm run check` runs the same code under tsx.
export { checkMaterial, type MaterialDraft } from "./material";
export { checkPractice, type PracticeDraft, type PracticeCheckOptions } from "./practice";
export { checkEvaluation, RESULT_KINDS, type AiResultKind, type EvaluationDraft } from "./evaluate";
export { gradeByApp, normalizeAnswer, type AppResult, type GradeableQuestion } from "./grade";
