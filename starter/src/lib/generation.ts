// Writing the practice set (Step 3). One practice question per missed
// question, in the original order. Every question must pass the active
// subject's checks (src/subjects); a failure is sent back to the AI with the
// problems, up to 3 tries, then the question is flagged for the adult.
import "server-only";
import { randomUUID } from "node:crypto";
import { mission } from "@mission";
import { GENERATION_INSTRUCTIONS, generationRequest } from "@/prompts/generation";
import { AiError, GENERATION_SETTINGS, ai, parseJsonReply } from "@/lib/ai";
import { subject } from "@/subjects";
import type { CheckReport, GeneratedQuestion, SourceQuestion } from "@/lib/checks";
import { findSessionFor, getSession, isUuid, updateSession, type GeneratedQuestionRecord, type Question } from "@/lib/store";

const MAX_TRIES = 3;
const PARALLEL = 4;
const STALE_MS = 5 * 60 * 1000;

export type PracticeOutcome = "ready" | "failed" | "busy" | "not_found" | "nothing_missed";

const toSource = (q: Question): SourceQuestion & { question_number: string } => ({
  question_number: q.question_number,
  question_text: q.original_question_text,
  format: q.format,
  choices: q.choices,
  correct_answer: q.correct_answer ?? "",
  question_type: q.question_type,
  picture_description: q.picture_description,
  requires_work: q.requires_work,
});

const instructions = () => GENERATION_INSTRUCTIONS + subject.promptHints({
  topic: mission.topic,
  level: mission.level,
  persona: mission.learner.persona,
});

/** Writes one practice question, retrying with the checker's problems. */
async function writeOne(
  original: SourceQuestion & { question_number?: string },
  extra = "",
): Promise<{ generated: GeneratedQuestion | null; report: CheckReport | null; tries: number }> {
  let feedback = extra;
  let best: { generated: GeneratedQuestion | null; report: CheckReport | null } = { generated: null, report: null };
  for (let tries = 1; tries <= MAX_TRIES; tries++) {
    try {
      const reply = await ai.ask({
        job: "generation",
        instructions: instructions(),
        parts: [{ text: generationRequest(original) + feedback }],
        ...GENERATION_SETTINGS,
      });
      const generated = parseJsonReply(reply.text) as GeneratedQuestion;
      const report = subject.checkGenerated(original, generated);
      best = { generated, report };
      if (report.passed) return { ...best, tries };
      feedback = `\n\nYour previous version failed the app's checks:\n- ${report.problems.join("\n- ")}\nWrite a new version that fixes these problems.`;
    } catch (e) {
      if (!(e instanceof AiError)) throw e;
      feedback = "\n\nYour previous answer couldn't be used. Return only the JSON described.";
    }
  }
  return { ...best, tries: MAX_TRIES };
}

function recordFor(
  generated: GeneratedQuestion | null,
  report: CheckReport | null,
  original: Question,
  tries: number,
): Omit<GeneratedQuestionRecord, "id" | "question_id" | "position"> {
  const g = generated;
  const usable = g && typeof g.question_text === "string" && typeof g.correct_answer === "string";
  return {
    question_text: usable ? g.question_text.slice(0, 4000) : "(A practice version couldn't be written. Regenerate or edit it.)",
    choices: usable && g.choices && typeof g.choices === "object" ? g.choices : null,
    picture_spec:
      usable && g.picture_spec && typeof g.picture_spec === "object"
        ? (g.picture_spec as Record<string, unknown>)
        : null,
    correct_answer: usable ? g.correct_answer.slice(0, 500) : "",
    steps_to_solve: usable && typeof g.steps_to_solve === "string" ? g.steps_to_solve.slice(0, 2000) : null,
    hint: usable && typeof g.hint === "string" ? g.hint.slice(0, 500) : null,
    requires_work: original.requires_work,
    check_status: report?.passed ? "passed" : "flagged",
    check_notes: report?.passed
      ? null
      : (report?.problems.join(" ") || "The practice question couldn't be checked.").slice(0, 1000),
    answer_check: usable ? (g.check ?? null) : null,
    generation_attempts: tries,
    grade: null,
  };
}

async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  return out;
}

/** Writes the whole practice set for a session (replacing any earlier one). */
export async function runPractice(sessionId: string): Promise<PracticeOutcome> {
  if (!isUuid(sessionId)) return "not_found";
  const session = await getSession(sessionId);
  if (!session) return "not_found";

  const staleBefore = Date.now() - STALE_MS;
  const status = session.practice_status;
  const startedAt = session.practice_started_at ? Date.parse(session.practice_started_at) : 0;
  const claimable =
    status === "none" || status === "failed" || status === "ready" || (status === "generating" && startedAt < staleBefore);
  if (!claimable) return "busy";

  try {
    await updateSession(sessionId, (s) => ({
      ...s,
      practice_status: "generating",
      practice_started_at: new Date().toISOString(),
      practice_error: null,
    }));

    const missed = session.assignment.questions.filter((q) => !q.marked_correct).sort((a, b) => a.position - b.position);
    if (!missed.length) {
      await updateSession(sessionId, (s) => ({ ...s, practice: [], practice_status: "ready" }));
      return "nothing_missed";
    }

    const results = await inBatches(missed, PARALLEL, async (q) => ({ q, ...(await writeOne(toSource(q))) }));
    const practice: GeneratedQuestionRecord[] = results.map(({ q, generated, report, tries }, i) => ({
      id: randomUUID(),
      question_id: q.id,
      position: i + 1,
      ...recordFor(generated, report, q, tries),
    }));

    await updateSession(sessionId, (s) => ({ ...s, practice, practice_status: "ready" }));
    return "ready";
  } catch (e) {
    const message = e instanceof AiError ? e.message : "Something went wrong while writing the practice set.";
    await updateSession(sessionId, (s) => ({ ...s, practice_status: "failed", practice_error: message }));
    return "failed";
  }
}

/** New numbers for one practice question (the adult tapped Regenerate). */
export async function regenerateOne(generatedQuestionId: string): Promise<"done" | "not_found"> {
  if (!isUuid(generatedQuestionId)) return "not_found";
  const session = await findSessionFor((s) => s.practice.some((p) => p.id === generatedQuestionId));
  if (!session) return "not_found";
  const gq = session.practice.find((p) => p.id === generatedQuestionId)!;
  const original = session.assignment.questions.find((q) => q.id === gq.question_id);
  if (!original) return "not_found";

  const { generated, report, tries } = await writeOne(
    toSource(original),
    `\n\nThe adult asked for a different version than this one: "${gq.question_text}". Use different numbers.`,
  );
  await updateSession(session.id, (s) => ({
    ...s,
    practice: s.practice.map((p) =>
      p.id === generatedQuestionId ? { ...p, ...recordFor(generated, report, original, tries) } : p,
    ),
  }));
  return "done";
}
