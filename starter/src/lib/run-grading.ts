// Grading the student's finished work (Step 5). One photo per work page goes
// to the AI with the grading prompt; results land on the practice records.
import "server-only";
import { GRADING_INSTRUCTIONS, gradingRequest, type GradingQuestion } from "@/prompts/grading";
import { AiError, ai, parseJsonReply, type AiPart } from "@/lib/ai";
import { GRADE_RESULTS } from "@/lib/grading";
import { getSession, isUuid, readWorkPage, updateSession } from "@/lib/store";

const STALE_MS = 5 * 60 * 1000;

export type GradingOutcome = "done" | "failed" | "busy" | "not_found" | "no_work";

interface GradeResultRow {
  id?: unknown;
  result?: unknown;
  student_answer_read?: unknown;
  work_shown?: unknown;
  feedback?: unknown;
}

export async function runGrading(sessionId: string): Promise<GradingOutcome> {
  if (!isUuid(sessionId)) return "not_found";
  const session = await getSession(sessionId);
  if (!session) return "not_found";
  if (!session.work.page_count) return "no_work";
  if (!session.practice.length) return "no_work";

  const staleBefore = Date.now() - STALE_MS;
  const status = session.work.grading_status;
  const startedAt = session.work.grading_started_at ? Date.parse(session.work.grading_started_at) : 0;
  const claimable =
    status === "none" || status === "failed" || status === "done" || (status === "grading" && startedAt < staleBefore);
  if (!claimable) return "busy";

  const fail = (message: string) =>
    updateSession(sessionId, (s) => ({
      ...s,
      work: { ...s.work, grading_status: "failed", grading_error: message },
    }));

  try {
    await updateSession(sessionId, (s) => ({
      ...s,
      work: { ...s.work, grading_status: "grading", grading_started_at: new Date().toISOString(), grading_error: null },
    }));

    const questions: GradingQuestion[] = session.practice.map((p) => ({
      id: p.id,
      question_text: p.question_text,
      correct_answer: p.correct_answer,
      requires_work: p.requires_work,
    }));
    const found = new Map<string, NonNullable<(typeof session.practice)[number]["grade"]>>();

    for (let n = 1; n <= session.work.page_count; n++) {
      const photo = await readWorkPage(sessionId, n);
      const parts: AiPart[] = [
        { text: `Page ${n} of ${session.work.page_count}` },
        { image: { mediaType: "image/jpeg", base64: photo.toString("base64") } },
        { text: gradingRequest(questions) },
      ];
      const reply = await ai.ask({ job: "grading", instructions: GRADING_INSTRUCTIONS, parts });
      const body = parseJsonReply(reply.text) as { results?: GradeResultRow[] };
      for (const r of body.results ?? []) {
        const id = typeof r.id === "string" ? r.id : "";
        if (!id || found.has(id)) continue;
        const result = GRADE_RESULTS.includes(r.result as (typeof GRADE_RESULTS)[number])
          ? (r.result as (typeof GRADE_RESULTS)[number])
          : "needs_check";
        found.set(id, {
          result,
          student_answer_read: typeof r.student_answer_read === "string" ? r.student_answer_read.slice(0, 500) : null,
          work_shown: typeof r.work_shown === "boolean" ? r.work_shown : null,
          feedback: typeof r.feedback === "string" ? r.feedback.slice(0, 1000) : null,
          overridden: false,
        });
      }
    }

    await updateSession(sessionId, (s) => ({
      ...s,
      work: { ...s.work, grading_status: "done", grading_error: null },
      practice: s.practice.map((p) => ({
        ...p,
        grade:
          found.get(p.id) ??
          { result: "needs_check", student_answer_read: null, work_shown: null, feedback: "Not found on the uploaded work.", overridden: false },
      })),
    }));
    return "done";
  } catch (e) {
    const message = e instanceof AiError ? e.message : "Something went wrong while grading the work.";
    await fail(message);
    return "failed";
  }
}
