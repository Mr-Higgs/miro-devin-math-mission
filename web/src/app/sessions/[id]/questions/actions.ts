"use server";

// The adult's corrections to how the test was read (Step 2). They run as the
// signed-in adult, so the database only lets them change their own questions.
import { refresh } from "next/cache";
import { getAdult } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/upload/paths";

async function signedIn() {
  const adult = await getAdult();
  return Boolean(adult?.onboarded);
}

/** One tap: correct <-> missed. Points follow (full points, or none). */
export async function setMarkedCorrect(questionId: string, markedCorrect: boolean): Promise<{ error?: string }> {
  if (!(await signedIn()) || !isUuid(questionId)) return { error: "Please sign in again." };
  const supabase = await createClient();
  const { data: q } = await supabase.from("questions").select("points_possible").eq("id", questionId).maybeSingle();
  if (!q) return { error: "That question wasn't found." };

  const { error } = await supabase
    .from("questions")
    .update({ marked_correct: markedCorrect, points_earned: markedCorrect ? (q.points_possible ?? 1) : 0 })
    .eq("id", questionId);
  if (error) return { error: "That change couldn't be saved. Please try again." };
  refresh();
  return {};
}

/** Fix the student's answer or the correct answer as read. */
export async function updateAnswers(
  questionId: string,
  studentAnswer: string,
  correctAnswer: string,
): Promise<{ error?: string }> {
  if (!(await signedIn()) || !isUuid(questionId)) return { error: "Please sign in again." };
  const clean = (s: string) => s.trim().slice(0, 500) || null;
  const supabase = await createClient();
  const { error } = await supabase
    .from("questions")
    .update({ student_answer: clean(studentAnswer), correct_answer: clean(correctAnswer) })
    .eq("id", questionId);
  if (error) return { error: "That change couldn't be saved. Please try again." };
  refresh();
  return {};
}
