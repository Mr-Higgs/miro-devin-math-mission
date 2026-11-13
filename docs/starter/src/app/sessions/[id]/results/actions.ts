"use server";

import { redirect } from "next/navigation";
import { isUuid, updateSession } from "@/lib/store";

/** "Try a new set": clears practice, answers and results — screen 3 writes a fresh set. */
export async function tryNewSet(sessionId: string): Promise<void> {
  if (!isUuid(sessionId)) redirect("/");
  await updateSession(sessionId, (s) => ({
    ...s,
    status: "in_progress",
    practice: { status: "none", started_at: null, error: null, questions: [] },
    answers: {},
    results: { status: "none", started_at: null, error: null, items: [], summary: null, next_steps: [] },
  }));
  redirect(`/sessions/${sessionId}/practice`);
}
