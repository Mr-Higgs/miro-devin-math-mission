"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { updateSession, isUuid } from "@/lib/store";
import { GRADE_RESULTS, type GradeResult } from "@/lib/grading";

/** One-tap override of the AI's grade on a practice question. */
export async function overrideGrade(
  sessionId: string,
  generatedId: string,
  result: GradeResult,
): Promise<{ error?: string }> {
  if (!isUuid(sessionId) || !isUuid(generatedId) || !GRADE_RESULTS.includes(result)) {
    return { error: "That change couldn't be saved." };
  }
  await updateSession(sessionId, (s) => ({
    ...s,
    practice: s.practice.map((p) =>
      p.id === generatedId && p.grade ? { ...p, grade: { ...p.grade, result, overridden: true } } : p,
    ),
  }));
  refresh();
  return {};
}

/** Marks the session done and returns home. */
export async function completeSession(sessionId: string): Promise<void> {
  if (isUuid(sessionId)) {
    await updateSession(sessionId, (s) => ({ ...s, status: "completed" }));
  }
  redirect("/");
}
