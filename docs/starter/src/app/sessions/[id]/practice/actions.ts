"use server";

import { redirect } from "next/navigation";
import { isUuid, updateSession } from "@/lib/store";

/** Saves the learner's answers, clears any old results, and shows screen 4. */
export async function submitAnswers(sessionId: string, form: FormData): Promise<void> {
  if (!isUuid(sessionId)) redirect("/");
  const answers: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (key.startsWith("q_") && typeof value === "string") answers[key.slice(2)] = value;
  }
  await updateSession(sessionId, (s) => ({
    ...s,
    answers,
    results: { status: "none", started_at: null, error: null, items: [], summary: null, next_steps: [] },
  }));
  redirect(`/sessions/${sessionId}/results`);
}
