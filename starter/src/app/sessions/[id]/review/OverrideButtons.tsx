"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import type { GradeResult } from "@/lib/grading";
import { overrideGrade } from "./actions";

/** One-tap grade override under each reviewed question. */
export function OverrideButtons({
  sessionId,
  generatedId,
  current,
}: {
  sessionId: string;
  generatedId: string;
  current: GradeResult;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const options: { result: GradeResult; label: string }[] = [
    { result: "pass", label: "Pass" },
    { result: "redo", label: "Redo" },
    { result: "needs_check", label: "Needs check" },
  ];

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {options.map((o) => (
        <Button
          key={o.result}
          variant={current === o.result ? "primary" : "quiet"}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const r = await overrideGrade(sessionId, generatedId, o.result);
              setError(r.error ?? null);
            })
          }
        >
          {o.label}
        </Button>
      ))}
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </div>
  );
}
