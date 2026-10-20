"use client";

import { useState, useTransition } from "react";
import { Button, TextField } from "@/components/ui";
import { setMarkedCorrect, updateAnswers } from "./actions";

/** Quick fixes under each question card: flip correct/missed, or fix the answers. */
export function QuestionControls({
  questionId,
  markedCorrect,
  studentAnswer,
  correctAnswer,
}: {
  questionId: string;
  markedCorrect: boolean;
  studentAnswer: string | null;
  correctAnswer: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<{ error?: string }>, after?: () => void) =>
    startTransition(async () => {
      const result = await action();
      setError(result.error ?? null);
      if (!result.error) after?.();
    });

  if (editing) {
    return (
      <form
        className="grid w-full gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          run(
            () => updateAnswers(questionId, String(form.get("student") ?? ""), String(form.get("correct") ?? "")),
            () => setEditing(false),
          );
        }}
      >
        <TextField label="Student's answer" name="student" defaultValue={studentAnswer ?? ""} hint="For multiple choice, the letter(s)." />
        <TextField label="Correct answer" name="correct" defaultValue={correctAnswer ?? ""} />
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          <Button variant="quiet" onClick={() => setEditing(false)} disabled={pending}>Cancel</Button>
        </div>
        {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
      </form>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => run(() => setMarkedCorrect(questionId, !markedCorrect))}
      >
        {pending ? "Saving…" : markedCorrect ? "Mark as missed" : "Mark as correct"}
      </Button>
      <Button variant="quiet" disabled={pending} onClick={() => setEditing(true)}>
        Edit answers
      </Button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </>
  );
}
