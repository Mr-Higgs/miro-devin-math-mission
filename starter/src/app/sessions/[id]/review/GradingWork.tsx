"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Notice } from "@/components/ui";

type Status = "none" | "grading" | "done" | "failed";

/** Shown on Step 5 until the work has been graded; starts it, waits, retries. */
export function GradingWork({ sessionId, status, error }: { sessionId: string; status: Status; error: string | null }) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [requestFailed, setRequestFailed] = useState(false);
  const started = useRef(false);

  const start = useCallback(async () => {
    setRequestFailed(false);
    setSeconds(0);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/grade`, { method: "POST" });
      if (!res.ok) setRequestFailed(true);
    } catch {
      setRequestFailed(true);
    }
    router.refresh();
  }, [sessionId, router]);

  useEffect(() => {
    if (status === "none" && !started.current) {
      started.current = true;
      void start();
    }
  }, [status, start]);

  useEffect(() => {
    if (status !== "none" && status !== "grading") return;
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    const check = status === "grading" ? setInterval(() => router.refresh(), 5000) : undefined;
    return () => {
      clearInterval(tick);
      if (check) clearInterval(check);
    };
  }, [status, router]);

  if (status === "failed" || requestFailed) {
    return (
      <Notice tone="danger" title="The work couldn't be graded">
        <p>{error ?? "Something went wrong. Check your connection and try again."}</p>
        <Button className="mt-3" onClick={() => void start()}>
          Try again
        </Button>
      </Notice>
    );
  }

  return (
    <Notice title="Grading the work…">
      The app is reading the student&apos;s answers and checking them against the practice questions
      {seconds > 0 && ` (${seconds}s so far)`}.
    </Notice>
  );
}
