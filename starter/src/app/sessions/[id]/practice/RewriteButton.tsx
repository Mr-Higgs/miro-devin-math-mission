"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

/** Writes the whole practice set again (e.g. after the missed questions changed). */
export function RewriteButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      className="mt-3"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch(`/api/sessions/${sessionId}/practice`, { method: "POST" }).catch(() => null);
        router.refresh();
        setBusy(false);
      }}
    >
      {busy ? "Writing… (under a minute)" : "Rewrite practice set"}
    </Button>
  );
}
