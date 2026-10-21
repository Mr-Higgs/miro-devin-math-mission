"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Notice } from "@/components/ui";
import { ACCEPT, MAX_FILES, PrepError, preparePages } from "@/lib/upload/prepare";
import { saveWork, useSampleWork } from "./actions";

type Status = { kind: "idle" } | { kind: "working"; message: string } | { kind: "error"; message: string };

/** Step 4: photos of the student's finished practice sheet. */
export function WorkForm({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const working = status.kind === "working";
  const sample = useSampleWork.bind(null, sessionId);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!files.length) return setStatus({ kind: "error", message: "Choose the photos of the finished sheet." });
    try {
      const pages = await preparePages(files, (done, total) =>
        setStatus({ kind: "working", message: `Preparing photos (${Math.min(done + 1, total)} of ${total})…` }),
      );
      for (const [i, page] of pages.entries()) {
        setStatus({ kind: "working", message: `Uploading page ${i + 1} of ${pages.length}…` });
        const res = await fetch(`/api/sessions/${sessionId}/work-pages/${i + 1}`, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: page.blob,
        });
        if (!res.ok) throw new PrepError(`Page ${i + 1} (${page.label}) didn't upload. Check your connection and try again.`);
      }
      setStatus({ kind: "working", message: "Saving…" });
      const result = await saveWork(sessionId, pages.length);
      if ("error" in result) throw new PrepError(result.error);
    } catch (e) {
      setStatus({ kind: "error", message: e instanceof PrepError ? e.message : "Something went wrong. Please try again." });
      return;
    }
    router.push(`/sessions/${sessionId}/review`);
  }

  return (
    <div className="grid gap-5">
      <form onSubmit={onSubmit} className="grid gap-5">
        <Notice title="Before you take photos">
          Photograph the student&apos;s finished practice sheet from straight above, in good light.
        </Notice>

        <div className="grid gap-2">
          <label htmlFor="files" className="text-sm font-medium text-ink">
            Finished work
          </label>
          <input
            id="files"
            type="file"
            multiple
            accept={ACCEPT}
            disabled={working}
            onChange={(e) => {
              setFiles(Array.from(e.target.files ?? []).slice(0, MAX_FILES));
              setStatus({ kind: "idle" });
            }}
            className="rounded-control border border-dashed border-line bg-surface-muted p-4 text-sm text-ink file:mr-3 file:rounded-control file:border-0 file:bg-accent file:px-3 file:py-2 file:text-accent-ink"
          />
          {files.length > 0 && (
            <ul className="text-sm text-ink-muted">
              {files.map((f) => (
                <li key={f.name + f.size}>• {f.name}</li>
              ))}
            </ul>
          )}
        </div>

        {status.kind === "error" && <Notice tone="danger">{status.message}</Notice>}
        {status.kind === "working" && <Notice>{status.message}</Notice>}

        <Button type="submit" size="lg" disabled={working}>
          {working ? "Working…" : "Upload and grade"}
        </Button>
      </form>

      <div className="rounded-control border border-line bg-surface-muted p-4">
        <p className="mb-2 text-sm text-ink-muted">
          No finished sheet handy? Use the bundled sample image — the mock grader doesn&apos;t look at the pixels.
        </p>
        <form action={sample}>
          <Button variant="secondary" type="submit">
            Use a sample of finished work
          </Button>
        </form>
      </div>
    </div>
  );
}
