"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Notice } from "@/components/ui";
import type { JobStatus } from "@/lib/store";

/** Shown on screen 3 until the practice set is written; starts it, waits, offers a retry. */
export function StartingPractice({ sessionId, status, error, count }: { sessionId: string; status: JobStatus; error: string | null; count: number }) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [requestFailed, setRequestFailed] = useState(false);
  const started = useRef(false);

  const start = useCallback(async () => {
    setRequestFailed(false);
    setSeconds(0);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/practice`, { method: "POST" });
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
    if (status !== "none" && status !== "working") return;
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    const check = status === "working" ? setInterval(() => router.refresh(), 5000) : undefined;
    return () => {
      clearInterval(tick);
      if (check) clearInterval(check);
    };
  }, [status, router]);

  if (status === "failed" || requestFailed) {
    return (
      <Notice tone="danger" title="The practice set couldn't be written">
        <p>{error ?? "Something went wrong. Check your connection and try again."}</p>
        <Button className="mt-3" onClick={() => void start()}>
          Try again
        </Button>
      </Notice>
    );
  }

  return (
    <Notice title="Writing practice questions…">
      {count} questions from the key ideas, each checked by the app before you see it. This usually takes under a
      minute{seconds > 0 && ` (${seconds}s so far)`}.
    </Notice>
  );
}
