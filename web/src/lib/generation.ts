// Writing the practice set (site map Step 3; decision 010). One practice
// question per missed question, in the original order. Every question must
// pass the app's math checks (web/src/lib/checks); a failure is sent back to
// the AI with the problems, up to 3 tries, then the question is flagged for
// the adult. Runs as the signed-in adult, so the privacy rules apply.
import "server-only";
import { GENERATION_INSTRUCTIONS, generationRequest } from "@/prompts/generation";
import { AiError, GENERATION_SETTINGS, askAi, parseJsonReply } from "@/lib/ai/gemini";
import { checkGenerated, type CheckReport, type GeneratedQuestion, type SourceQuestion } from "@/lib/checks";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/upload/paths";

const MAX_TRIES = 3;
const PARALLEL = 4;
const STALE_MS = 5 * 60 * 1000;

export type PracticeOutcome = "ready" | "failed" | "busy" | "not_found" | "nothing_missed";

interface OriginalRow {
  id: string;
  position: number;
  original_question_text: string;
  format: SourceQuestion["format"];
  choices: Json | null;
  correct_answer: string | null;
  question_type: string | null;
  picture_description: string | null;
  requires_work: boolean;
}

const toSource = (q: OriginalRow): SourceQuestion => ({
  question_text: q.original_question_text,
  format: q.format,
  choices: (q.choices as Record<string, string> | null) ?? null,
  correct_answer: q.correct_answer ?? "",
  question_type: q.question_type,
  picture_description: q.picture_description,
  requires_work: q.requires_work,
});

/** Writes one practice question, retrying with the checker's problems. */
async function writeOne(original: SourceQuestion, extra = ""): Promise<{ generated: GeneratedQuestion | null; report: CheckReport | null; tries: number }> {
  let feedback = extra;
  let best: { generated: GeneratedQuestion | null; report: CheckReport | null } = { generated: null, report: null };
  for (let tries = 1; tries <= MAX_TRIES; tries++) {
    try {
      const reply = await askAi(GENERATION_INSTRUCTIONS, [{ text: generationRequest(original) + feedback }], GENERATION_SETTINGS);
      const generated = parseJsonReply(reply.text) as GeneratedQuestion;
      const report = checkGenerated(original, generated);
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

function rowFor(generated: GeneratedQuestion | null, report: CheckReport | null, original: OriginalRow, tries: number) {
  const g = generated;
  const usable = g && typeof g.question_text === "string" && typeof g.correct_answer === "string";
  return {
    question_text: usable ? g.question_text.slice(0, 4000) : "(A practice version couldn't be written. Regenerate or edit it.)",
    choices: usable && g.choices && typeof g.choices === "object" ? (g.choices as Json) : null,
    picture_spec: usable ? ((g.picture_spec ?? null) as Json) : null,
    correct_answer: usable ? g.correct_answer.slice(0, 500) : "",
    steps_to_solve: usable && typeof g.steps_to_solve === "string" ? g.steps_to_solve.slice(0, 2000) : null,
    hint: usable && typeof g.hint === "string" ? g.hint.slice(0, 500) : null,
    requires_work: original.requires_work,
    check_status: report?.passed ? ("passed" as const) : ("flagged" as const),
    check_notes: report?.passed ? null : (report?.problems.join(" ") || "The practice question couldn't be checked.").slice(0, 1000),
    answer_check: usable ? ((g.check ?? null) as Json) : null,
    generation_attempts: tries,
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
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("id, assignment:assignments(id, questions(id, position, original_question_text, format, choices, correct_answer, question_type, picture_description, requires_work, marked_correct))")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session?.assignment) return "not_found";

  const staleBefore = new Date(Date.now() - STALE_MS).toISOString();
  const { data: claimed } = await supabase
    .from("sessions")
    .update({ practice_status: "generating", practice_started_at: new Date().toISOString(), practice_error: null })
    .eq("id", sessionId)
    .or(`practice_status.in.(none,failed,ready),and(practice_status.eq.generating,practice_started_at.lt.${staleBefore})`)
    .select("id");
  if (!claimed?.length) return "busy";

  try {
    const missed = session.assignment.questions.filter((q) => !q.marked_correct).sort((a, b) => a.position - b.position);
    await supabase.from("generated_questions").delete().eq("session_id", sessionId);
    if (!missed.length) {
      await supabase.from("sessions").update({ practice_status: "ready" }).eq("id", sessionId);
      return "nothing_missed";
    }

    const results = await inBatches(missed, PARALLEL, async (q) => ({ q, ...(await writeOne(toSource(q))) }));
    const { error } = await supabase.from("generated_questions").insert(
      results.map(({ q, generated, report, tries }, i) => ({
        session_id: sessionId,
        question_id: q.id,
        position: i + 1,
        ...rowFor(generated, report, q, tries),
      })),
    );
    if (error) throw error;

    await supabase.from("sessions").update({ practice_status: "ready" }).eq("id", sessionId);
    return "ready";
  } catch (e) {
    const message = e instanceof AiError ? e.message : "Something went wrong while writing the practice set.";
    await supabase.from("sessions").update({ practice_status: "failed", practice_error: message }).eq("id", sessionId);
    return "failed";
  }
}

/** New numbers for one practice question (the adult tapped Regenerate). */
export async function regenerateOne(generatedQuestionId: string): Promise<"done" | "not_found"> {
  if (!isUuid(generatedQuestionId)) return "not_found";
  const supabase = await createClient();
  const { data: gq } = await supabase
    .from("generated_questions")
    .select("id, question_text, original:questions(id, position, original_question_text, format, choices, correct_answer, question_type, picture_description, requires_work)")
    .eq("id", generatedQuestionId)
    .maybeSingle();
  if (!gq?.original) return "not_found";

  const original = gq.original as OriginalRow;
  const { generated, report, tries } = await writeOne(
    toSource(original),
    `\n\nThe adult asked for a different version than this one: "${gq.question_text}". Use different numbers.`,
  );
  await supabase.from("generated_questions").update(rowFor(generated, report, original, tries)).eq("id", generatedQuestionId);
  return "done";
}
