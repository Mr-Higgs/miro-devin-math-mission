// Reading the signed-in adult's sessions. The database's privacy rules make
// sure these only ever return the adult's own rows.
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { UPLOADS_BUCKET, isUuid } from "@/lib/upload/paths";

export async function listSessions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, status, started_at, updated_at, assignment:assignments(student_nickname, assignment_name)")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

/** One session with its assignment and pages (with short-lived links to the photos), or null. */
export async function getSession(id: string) {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, status, started_at, assignment:assignments(id, student_nickname, assignment_name, extraction_status, extraction_started_at, extraction_error, created_at, pages:assignment_pages(page_order, file_path, deleted_at, rotation), questions(id, position, question_number, original_question_text, format, choices, picture_description, student_answer, correct_answer, points_possible, points_earned, marked_correct, requires_work, confidence), extraction_results(notes, score_as_written, created_at))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data?.assignment) return null;

  const pages = [...data.assignment.pages].sort((a, b) => a.page_order - b.page_order);
  const live = pages.filter((p) => !p.deleted_at).map((p) => p.file_path);
  const { data: signed } = live.length
    ? await supabase.storage.from(UPLOADS_BUCKET).createSignedUrls(live, 60 * 10)
    : { data: [] };
  const urlFor = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  const questions = [...data.assignment.questions]
    .sort((a, b) => a.position - b.position)
    .map((q) => ({ ...q, choices: (q.choices ?? null) as Record<string, string> | null }));
  const latestResult = [...data.assignment.extraction_results].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

  return {
    ...data,
    assignment: {
      ...data.assignment,
      questions,
      notes: latestResult?.notes ?? null,
      scoreAsWritten: latestResult?.score_as_written ?? null,
      pages: pages.map((p) => ({ ...p, url: p.deleted_at ? null : (urlFor.get(p.file_path) ?? null) })),
    },
  };
}
