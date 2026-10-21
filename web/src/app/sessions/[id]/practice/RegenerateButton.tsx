"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { withBasePath } from "@/config/base-path";

/** New numbers for one practice question. */
export function RegenerateButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setFailed(false);
          try {
            const res = await fetch(withBasePath(`/api/practice/${id}/regenerate`), { method: "POST" });
            if (!res.ok) setFailed(true);
          } catch {
            setFailed(true);
          }
          router.refresh();
          setBusy(false);
        }}
      >
        {busy ? "Writing a new version…" : "Regenerate"}
      </Button>
      {failed && <p className="w-full text-sm text-danger">That didn&apos;t work. Please try again.</p>}
    </>
  );
}
