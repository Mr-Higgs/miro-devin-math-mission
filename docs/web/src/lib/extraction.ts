// Reading the test (site map Step 2, "Read the test"; decisions 002, 009).
// Sends the uploaded pages to the AI with the extraction prompt, then saves the
// questions, the AI's notes, and which way each page is turned. Runs as the
// signed-in adult, so the database's privacy rules apply throughout.
import "server-only";
import { EXTRACTION_INSTRUCTIONS, EXTRACTION_REQUEST } from "@/prompts/extraction";
import { AI_MODEL, AiError, EXTRACTION_SETTINGS, askAi, parseJsonReply, type AiPart } from "@/lib/ai/gemini";
import { enhanceForReading } from "@/lib/ai/enhance";
import { secondLook } from "@/lib/second-look";
import { createClient } from "@/lib/supabase/server";
import { UPLOADS_BUCKET, isUuid } from "@/lib/upload/paths";

/** A run older than this is treated as stuck and may be retried. */
const STALE_MS = 5 * 60 * 1000; // longer than the route's 4-minute limit
const FORMATS = ["multiple_choice", "multiple_select", "fill_in", "open_response"] as const;
const ROTATIONS = [0, 90, 180, 270] as const;

export type ExtractionOutcome = "done" | "failed" | "busy" | "not_found";

const str = (v: unknown, max = 4000) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);
const unit = (v: unknown) => { const n = num(v); return n === null ? null : Math.min(1, Math.max(0, n)); };

export async function runExtraction(sessionId: string): Promise<ExtractionOutcome> {
  if (!isUuid(sessionId)) return "not_found";
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("assignment:assignments(id, pages:assignment_pages(id, page_order, file_path, deleted_at))")
    .eq("id", sessionId)
    .maybeSingle();
  const assignment = session?.assignment;
  if (!assignment) return "not_found";

  // Claim the job, so two tabs (or a double click) don't read the test twice.
  const staleBefore = new Date(Date.now() - STALE_MS).toISOString();
  const { data: claimed } = await supabase
    .from("assignments")
    .update({ extraction_status: "processing", extraction_started_at: new Date().toISOString(), extraction_error: null })
    .eq("id", assignment.id)
    .or(`extraction_status.in.(pending,failed),and(extraction_status.eq.processing,extraction_started_at.lt.${staleBefore})`)
    .select("id");
  if (!claimed?.length) return "busy";

  try {
    const pages = [...assignment.pages].filter((p) => !p.deleted_at).sort((a, b) => a.page_order - b.page_order);
    if (!pages.length) throw new AiError("The photos for this test have been deleted, so it can't be read again.");

    // The pages are the adult's own private files, already cleaned in the browser.
    const parts: AiPart[] = [];
    const photos: AiPart[] = []; // each photo on its own, for the second look
    for (const [i, page] of pages.entries()) {
      const { data: blob, error } = await supabase.storage.from(UPLOADS_BUCKET).download(page.file_path);
      if (error || !blob) throw new AiError(`Page ${i + 1} couldn't be opened.`);
      parts.push({ text: `Photo ${i + 1} of ${pages.length}` });
      const photo = Buffer.from(await blob.arrayBuffer());
      const sent = EXTRACTION_SETTINGS.enhance ? await enhanceForReading(photo) : photo;
      const image: AiPart = { image: { mediaType: "image/jpeg", base64: sent.toString("base64") } };
      parts.push(image);
      photos.push(image);
    }
    parts.push({ text: EXTRACTION_REQUEST });

    const answer = await askAi(EXTRACTION_INSTRUCTIONS, parts, EXTRACTION_SETTINGS);
    const reply = parseJsonReply(answer.text) as Record<string, unknown>;
    const rawQuestions = Array.isArray(reply.questions) ? (reply.questions as Record<string, unknown>[]) : [];
    if (!rawQuestions.length) throw new AiError("No questions were found on these pages. Check the photos are of a graded test.");

    const questions = rawQuestions.map((q, i) => {
      const choices = q.choices && typeof q.choices === "object" && !Array.isArray(q.choices)
        ? Object.fromEntries(Object.entries(q.choices as Record<string, unknown>).map(([k, v]) => [k.slice(0, 3), String(v).slice(0, 500)]))
        : null;
      const format = FORMATS.includes(q.format as (typeof FORMATS)[number]) ? (q.format as (typeof FORMATS)[number]) : choices ? "multiple_choice" : "fill_in";
      return {
        assignment_id: assignment.id,
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
        (await askAi(instructions, [{ text: `Photo ${photo}` }, photos[photo - 1], { text: request }], EXTRACTION_SETTINGS)).text,
    );
    for (const q of questions) {
      const answer = look.found.get(q.question_number);
      if (answer && !q.student_answer) q.student_answer = answer;
    }
    const lookNote = look.found.size
      ? `A second look found the student's answer to question${look.found.size > 1 ? "s" : ""} ${[...look.found.keys()].join(", ")}.`
      : null;

    const confidences = questions.map((q) => q.confidence).filter((c): c is number => c !== null);
    const rotations = new Map<number, number>(
      (Array.isArray(reply.pages) ? (reply.pages as Record<string, unknown>[]) : [])
        .map((p) => [num(p.photo) ?? 0, num(p.rotation) ?? 0] as [number, number])
        .filter(([, r]) => (ROTATIONS as readonly number[]).includes(r)),
    );

    // Replace any earlier reading of this test (e.g. a retry).
    await supabase.from("questions").delete().eq("assignment_id", assignment.id);
    await supabase.from("extraction_results").delete().eq("assignment_id", assignment.id);

    const { error: resultError } = await supabase.from("extraction_results").insert({
      assignment_id: assignment.id,
      model_used: AI_MODEL,
      extraction_confidence: confidences.length ? Number((confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2)) : null,
      notes: [str(reply.notes, 1800), lookNote].filter(Boolean).join(" ") || null,
      score_as_written: str((reply.total_score as Record<string, unknown> | null)?.as_written, 40),
    });
    if (resultError) throw resultError;
    const { error: questionsError } = await supabase.from("questions").insert(questions);
    if (questionsError) throw questionsError;

    for (const [i, page] of pages.entries()) {
      const rotation = rotations.get(i + 1) ?? 0;
      await supabase.from("assignment_pages").update({ rotation }).eq("id", page.id);
    }

    await supabase
      .from("assignments")
      .update({ extraction_status: "done", extraction_error: null })
      .eq("id", assignment.id);
    return "done";
  } catch (e) {
    const message = e instanceof AiError ? e.message : "Something went wrong while reading the test.";
    await supabase
      .from("assignments")
      .update({ extraction_status: "failed", extraction_error: message })
      .eq("id", assignment.id);
    return "failed";
  }
}
