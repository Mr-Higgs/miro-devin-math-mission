"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Notice } from "@/components/ui";

type Status = "pending" | "processing" | "done" | "failed";

/**
 * Shown on Step 2 until the test has been read. Starts the reading when the
 * page opens, keeps the adult informed, and offers a retry if it fails.
 */
export function ReadingTest({ sessionId, status, error }: { sessionId: string; status: Status; error: string | null }) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [requestFailed, setRequestFailed] = useState(false);
  const started = useRef(false);

  const start = useCallback(async () => {
    setRequestFailed(false);
    setSeconds(0);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/extract`, { method: "POST" });
      if (!res.ok) setRequestFailed(true);
    } catch {
      setRequestFailed(true);
    }
    router.refresh(); // shows the questions (or the reason it failed)
  }, [sessionId, router]);

  // Start once when the page opens with an unread test.
  useEffect(() => {
    if (status === "pending" && !started.current) {
      started.current = true;
      void start();
    }
  }, [status, start]);

  // While reading (here or in another tab), count up and check back regularly.
  useEffect(() => {
    if (status !== "pending" && status !== "processing") return;
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    const check = status === "processing" ? setInterval(() => router.refresh(), 5000) : undefined;
    return () => {
      clearInterval(tick);
      if (check) clearInterval(check);
    };
  }, [status, router]);

  if (status === "failed" || requestFailed) {
    return (
      <Notice tone="danger" title="The test couldn't be read">
        <p>{error ?? "Something went wrong. Check your connection and try again."}</p>
        <Button className="mt-3" onClick={() => void start()}>
          Try again
        </Button>
      </Notice>
    );
  }

  return (
    <Notice title="Reading the test…">
      The app is finding every question and which ones were missed. This usually takes a minute or two
      {seconds > 0 && ` (${seconds}s so far)`}. You can leave this page open.
    </Notice>
  );
}
