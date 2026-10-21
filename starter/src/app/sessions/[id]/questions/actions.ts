"use server";

// The adult's corrections to how the test was read (Step 2).
import { refresh } from "next/cache";
import { findSessionFor, updateSession } from "@/lib/store";
import { isUuid } from "@/lib/upload/paths";

/** One tap: correct <-> missed. Points follow (full points, or none). */
export async function setMarkedCorrect(questionId: string, markedCorrect: boolean): Promise<{ error?: string }> {
  if (!isUuid(questionId)) return { error: "That question wasn't found." };
  const session = await findSessionFor((s) => s.assignment.questions.some((q) => q.id === questionId));
  if (!session) return { error: "That question wasn't found." };

  await updateSession(session.id, (s) => ({
    ...s,
    assignment: {
      ...s.assignment,
      questions: s.assignment.questions.map((q) =>
        q.id === questionId
          ? { ...q, marked_correct: markedCorrect, points_earned: markedCorrect ? (q.points_possible ?? 1) : 0 }
          : q,
      ),
    },
  }));
  refresh();
  return {};
}

/** Fix the student's answer or the correct answer as read. */
export async function updateAnswers(
  questionId: string,
  studentAnswer: string,
  correctAnswer: string,
): Promise<{ error?: string }> {
  if (!isUuid(questionId)) return { error: "That question wasn't found." };
  const clean = (s: string) => s.trim().slice(0, 500) || null;
  const session = await findSessionFor((s) => s.assignment.questions.some((q) => q.id === questionId));
  if (!session) return { error: "That question wasn't found." };

  await updateSession(session.id, (s) => ({
    ...s,
    assignment: {
      ...s.assignment,
      questions: s.assignment.questions.map((q) =>
        q.id === questionId ? { ...q, student_answer: clean(studentAnswer), correct_answer: clean(correctAnswer) } : q,
      ),
    },
  }));
  refresh();
  return {};
}
