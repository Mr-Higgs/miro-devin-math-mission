// Reading sessions and practice sets, backed by the local store
// (src/lib/store). Field names mirror web's so the pages port cleanly.
import "server-only";
import { getSession as storeGetSession, isUuid, type Question } from "@/lib/store";


export { listSessions, getSession } from "@/lib/store";
export type { SessionSummary } from "@/lib/store";

export type PracticeQuestion = ReturnType<typeof withOriginals>["practice"][number];

function withOriginals(session: NonNullable<Awaited<ReturnType<typeof storeGetSession>>>) {
  const byId = new Map<string, Question>(session.assignment.questions.map((q) => [q.id, q]));
  return {
    ...session,
    missedCount: session.assignment.questions.filter((q) => !q.marked_correct).length,
    practice: [...session.practice]
      .sort((a, b) => a.position - b.position)
      .map((p) => {
        const o = p.question_id ? byId.get(p.question_id) : undefined;
        return {
          ...p,
          original: o
            ? {
                question_number: o.question_number,
                original_question_text: o.original_question_text,
                choices: o.choices,
                correct_answer: o.correct_answer,
              }
            : null,
        };
      }),
  };
}

/** A session's practice set (Step 3), with each practice question's original. */
export async function getPractice(id: string) {
  if (!isUuid(id)) return null;
  const session = await storeGetSession(id);
  if (!session) return null;
  return withOriginals(session);
}
