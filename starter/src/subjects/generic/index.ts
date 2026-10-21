// Generic subject: no math-specific checks. A generated question must have
// the required fields, keep the original's format and choice count, and have
// a different answer.
import type { CheckReport, GeneratedQuestion, SourceQuestion } from "@/lib/checks";
import type { Subject } from "../types";

function checkGenerated(original: SourceQuestion, generated: GeneratedQuestion): CheckReport {
  const problems: string[] = [];
  const verified: string[] = [];

  for (const field of ["question_text", "correct_answer", "steps_to_solve", "hint"] as const) {
    if (typeof generated[field] !== "string" || !generated[field].trim()) problems.push(`Missing ${field}`);
  }

  const isChoice = original.format === "multiple_choice" || original.format === "multiple_select";
  if (isChoice) {
    const keys = generated.choices ? Object.keys(generated.choices) : [];
    const originalKeys = original.choices ? Object.keys(original.choices) : [];
    if (!keys.length) problems.push("Choices are missing");
    else if (originalKeys.length && keys.length !== originalKeys.length) {
      problems.push(`Has ${keys.length} choices; the original has ${originalKeys.length}`);
    }
  } else if (generated.choices && Object.keys(generated.choices).length) {
    problems.push("Has choices, but the original doesn't");
  }

  if (
    generated.correct_answer &&
    original.correct_answer &&
    generated.correct_answer.trim().toLowerCase() === original.correct_answer.trim().toLowerCase()
  ) {
    problems.push("The answer is the same as the original's");
  } else if (generated.correct_answer) {
    verified.push("Answer differs from the original");
  }

  return { passed: problems.length === 0, mathChecked: false, problems, verified };
}

export const generic: Subject = {
  name: "generic",
  checkGenerated,
  Picture: null,
  promptHints: ({ topic, level, persona }) => `
Learner and level:
- The learner is ${persona}. Topic: ${topic}. Level: ${level} — beginner: keep it simple; intermediate: match the original's difficulty; advanced: slightly harder, no extra scaffolding.`,
};
