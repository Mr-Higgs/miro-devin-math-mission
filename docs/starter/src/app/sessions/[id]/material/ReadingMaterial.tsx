"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Notice } from "@/components/ui";
import type { JobStatus } from "@/lib/store";

/**
 * Shown on screen 2 until the material has been read. Starts the reading when
 * the page opens, keeps the learner informed, and offers a retry if it fails.
 */
export function ReadingMaterial({ sessionId, status, error }: { sessionId: string; status: JobStatus; error: string | null }) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [requestFailed, setRequestFailed] = useState(false);
  const started = useRef(false);

  const start = useCallback(async () => {
    setRequestFailed(false);
    setSeconds(0);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/read`, { method: "POST" });
      if (!res.ok) setRequestFailed(true);
    } catch {
      setRequestFailed(true);
    }
    router.refresh(); // shows the summary and key ideas (or the reason it failed)
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
      <Notice tone="danger" title="The material couldn't be read">
        <p>{error ?? "Something went wrong. Check your connection and try again."}</p>
        <Button className="mt-3" onClick={() => void start()}>
          Try again
        </Button>
      </Notice>
    );
  }

  return (
    <Notice title="Reading the material…">
      The app is picking out the key ideas to practice. This usually takes under a minute
      {seconds > 0 && ` (${seconds}s so far)`}. You can leave this page open.
    </Notice>
  );
}
