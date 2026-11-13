import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TEST_DATA_DIR, parseJsonReply } from "./common.js";
import {
  checkGenerated, correctLetters, type CheckReport, type GeneratedQuestion, type SourceQuestion,
} from "../../src/lib/checks/index.js";

export interface GenerationCase {
  id: string;
  source: string;
  original: SourceQuestion;
  reference: GeneratedQuestion;
  reference_is_bad?: boolean; // a deliberately wrong example the checks must catch
}

export function loadGenerationCases(): GenerationCase[] {
  const file = join(TEST_DATA_DIR, "generation", "cases.json");
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")).cases : [];
}

export interface GenerationOutcome {
  id: string;
  validJson: boolean;
  report: CheckReport | null;
  generated: GeneratedQuestion | null;
  error?: string;
}

export function scoreGeneration(c: GenerationCase, replyText: string): GenerationOutcome {
  let generated: GeneratedQuestion;
  try {
    generated = parseJsonReply(replyText);
  } catch (e: any) {
    return { id: c.id, validJson: false, report: null, generated: null, error: e.message };
  }
  return { id: c.id, validJson: true, report: checkGenerated(c.original, generated), generated };
}

export function summarizeGeneration(outcomes: GenerationOutcome[]) {
  const n = outcomes.length;
  const rate = (k: number) => (n ? k / n : NaN);
  const passed = outcomes.filter((o) => o.report?.passed);
  return {
    cases: n,
    validJson: rate(outcomes.filter((o) => o.validJson).length),
    passed: rate(passed.length),
    // Passed AND the app confirmed the answer with math (not just format checks).
    passedMathChecked: rate(passed.filter((o) => o.report?.mathChecked).length),
    flagged: outcomes
      .filter((o) => !o.report?.passed)
      .map((o) => `${o.id}: ${o.error ?? o.report?.problems.join("; ")}`),
  };
}

/** Dry-run self-check: good references must pass, bad ones and broken copies must fail. */
export function selfCheckGeneration(cases: GenerationCase[]): string[] {
  const failures: string[] = [];
  for (const c of cases) {
    const report = checkGenerated(c.original, c.reference);
    if (c.reference_is_bad) {
      if (report.passed) failures.push(`${c.id}: deliberately bad example was not caught`);
      continue;
    }
    if (!report.passed) failures.push(`${c.id}: good example failed: ${report.problems.join("; ")}`);
    if (!report.mathChecked) continue;
    // Break the answer: move to a different choice, or add 1 to the number.
    const broken = { ...c.reference };
    if (broken.choices) {
      const right = correctLetters(broken.correct_answer, broken.choices);
      const wrong = Object.keys(broken.choices).find((k) => !right.includes(k))!;
      broken.correct_answer = right.length > 1 ? [...right.slice(1), wrong].join(", ") : wrong;
    } else if (/^\s*(yes|no)\b/i.test(broken.correct_answer)) {
      broken.correct_answer = /^\s*yes/i.test(broken.correct_answer) ? "No" : "Yes";
    } else {
      broken.correct_answer = broken.correct_answer.replace(/\d+/, (d) => String(Number(d) + 1));
    }
    if (checkGenerated(c.original, broken).passed) failures.push(`${c.id}: a wrong answer was not caught`);
  }
  return failures;
}

/** Original next to generated, for the tutor to read in summary.md. */
export function generationDetails(outcomes: GenerationOutcome[], cases: GenerationCase[]): string[] {
  const lines: string[] = [];
  for (const o of outcomes) {
    const c = cases.find((x) => x.id === o.id)!;
    const show = (q: { question_text: string; choices: Record<string, string> | null; correct_answer: string }) =>
      `${q.question_text}${q.choices ? " " + Object.entries(q.choices).map(([k, v]) => `(${k}) ${v}`).join(" ") : ""} → **${q.correct_answer}**`;
    lines.push(`- **${o.id}** ${o.report?.passed ? "✅" : "⚠️"}`);
    lines.push(`  - Original: ${show(c.original)}`);
    if (o.generated) {
      lines.push(`  - Practice: ${show(o.generated)}`);
      if (o.generated.picture_spec) lines.push(`  - Picture: \`${JSON.stringify(o.generated.picture_spec)}\``);
    }
    const notes = o.error ? [o.error] : o.report?.passed ? o.report.verified : o.report?.problems ?? [];
    lines.push(`  - Checks: ${notes.join("; ") || "—"}`);
  }
  return lines;
}
