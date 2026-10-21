// Reading the test (Step 2). Sends the uploaded pages to the AI with the
// extraction prompt, then saves the questions, the AI's notes, and which way
// each page is turned — into the local store.
import "server-only";
import { randomUUID } from "node:crypto";
import { EXTRACTION_INSTRUCTIONS, EXTRACTION_REQUEST } from "@/prompts/extraction";
import { AiError, EXTRACTION_SETTINGS, ai, parseJsonReply, type AiPart } from "@/lib/ai";
import { enhanceForReading } from "@/lib/ai/enhance";
import { secondLook } from "@/lib/second-look";
import { getSession, isUuid, readPage, updateSession, type Question } from "@/lib/store";

/** A run older than this is treated as stuck and may be retried. */
const STALE_MS = 5 * 60 * 1000;
const FORMATS = ["multiple_choice", "multiple_select", "fill_in", "open_response"] as const;
const ROTATIONS = [0, 90, 180, 270] as const;

export type ExtractionOutcome = "done" | "failed" | "busy" | "not_found";

const str = (v: unknown, max = 4000) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const num = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
const unit = (v: unknown) => {
  const n = num(v);
  return n === null ? null : Math.min(1, Math.max(0, n));
};

export async function runExtraction(sessionId: string): Promise<ExtractionOutcome> {
  if (!isUuid(sessionId)) return "not_found";
  const session = await getSession(sessionId);
  if (!session) return "not_found";

  // Claim the job, so two tabs (or a double click) don't read the test twice.
  const staleBefore = Date.now() - STALE_MS;
  const status = session.assignment.extraction_status;
  const startedAt = session.assignment.extraction_started_at
    ? Date.parse(session.assignment.extraction_started_at)
    : 0;
  const claimable =
    status === "pending" || status === "failed" || (status === "processing" && startedAt < staleBefore);
  if (!claimable) return "busy";

  const fail = (message: string) =>
    updateSession(sessionId, (s) => ({
      ...s,
      assignment: { ...s.assignment, extraction_status: "failed", extraction_error: message },
    }));

  try {
    await updateSession(sessionId, (s) => ({
      ...s,
      assignment: {
        ...s.assignment,
        extraction_status: "processing",
        extraction_started_at: new Date().toISOString(),
        extraction_error: null,
      },
    }));

    const pageCount = session.assignment.page_count;
    if (!pageCount) throw new AiError("The photos for this test are missing, so it can't be read.");

    const parts: AiPart[] = [];
    const photos: AiPart[] = []; // each photo on its own, for the second look
    for (let i = 1; i <= pageCount; i++) {
      parts.push({ text: `Photo ${i} of ${pageCount}` });
      const photo = await readPage(sessionId, i);
      const sent = EXTRACTION_SETTINGS.enhance ? await enhanceForReading(photo) : photo;
      const image: AiPart = { image: { mediaType: "image/jpeg", base64: sent.toString("base64") } };
      parts.push(image);
      photos.push(image);
    }
    parts.push({ text: EXTRACTION_REQUEST });

    const answer = await ai.ask({ job: "extraction", instructions: EXTRACTION_INSTRUCTIONS, parts, ...EXTRACTION_SETTINGS });
    const reply = parseJsonReply(answer.text) as Record<string, unknown>;
    const rawQuestions = Array.isArray(reply.questions) ? (reply.questions as Record<string, unknown>[]) : [];
    if (!rawQuestions.length)
      throw new AiError("No questions were found on these pages. Check the photos are of a graded test.");

    const questions: Question[] = rawQuestions.map((q, i) => {
      const choices =
        q.choices && typeof q.choices === "object" && !Array.isArray(q.choices)
          ? Object.fromEntries(
              Object.entries(q.choices as Record<string, unknown>).map(([k, v]) => [k.slice(0, 3), String(v).slice(0, 500)]),
            )
          : null;
      const format = FORMATS.includes(q.format as (typeof FORMATS)[number])
        ? (q.format as (typeof FORMATS)[number])
        : choices
          ? "multiple_choice"
          : "fill_in";
      return {
        id: randomUUID(),
        position: i + 1,
        question_number: str(q.question_number, 20) ?? String(num(q.question_number) ?? i + 1),
        original_question_text: str(q.original_question_text) ?? "(question text not read)",
        format,
        choices: choices && Object.keys(choices).length ? choices : null,
        picture_description: str(q.picture_description, 1000),
        question_type: str(q.question_type, 80),
        student_answer: str(q.student_answer, 500),
        correct_answer: str(q.correct_answer, 500),
        points_possible: num(q.points_possible),
        points_earned: num(q.points_earned),
        marked_correct: q.marked_correct === true,
        requires_work: q.requires_work === true,
        confidence: unit(q.confidence),
      };
    });

    // Second look at the photos of any question whose student answer wasn't found.
    const look = await secondLook(
      questions.map((q, i) => ({ ...q, photo: num(rawQuestions[i].photo) })),
      photos.length,
      async (instructions, photo, request) =>
        (
          await ai.ask({
            job: "second_look",
            instructions,
            parts: [{ text: `Photo ${photo}` }, photos[photo - 1], { text: request }],
            ...EXTRACTION_SETTINGS,
          })
        ).text,
    );
    for (const q of questions) {
      const found = look.found.get(q.question_number);
      if (found && !q.student_answer) q.student_answer = found;
    }
    const lookNote = look.found.size
      ? `A second look found the student's answer to question${look.found.size > 1 ? "s" : ""} ${[...look.found.keys()].join(", ")}.`
      : null;

    const confidences = questions.map((q) => q.confidence).filter((c): c is number => c !== null);
    void confidences; // average confidence is kept in web's DB; the store keeps notes only
    const rotations = new Map<number, number>(
      (Array.isArray(reply.pages) ? (reply.pages as Record<string, unknown>[]) : [])
        .map((p) => [num(p.photo) ?? 0, num(p.rotation) ?? 0] as [number, number])
        .filter(([, r]) => (ROTATIONS as readonly number[]).includes(r)),
    );

    await updateSession(sessionId, (s) => ({
      ...s,
      assignment: {
        ...s.assignment,
        questions, // replace any earlier reading of this test (e.g. a retry)
        notes: [str(reply.notes, 1800), lookNote].filter(Boolean).join(" ") || null,
        scoreAsWritten: str((reply.total_score as Record<string, unknown> | null)?.as_written, 40),
        page_rotations: Object.fromEntries(rotations),
        extraction_status: "done",
        extraction_error: null,
      },
    }));
    return "done";
  } catch (e) {
    const message = e instanceof AiError ? e.message : "Something went wrong while reading the test.";
    await fail(message);
    return "failed";
  }
}
