"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Notice, TextField } from "@/components/ui";
import { ACCEPT, MAX_FILES, PrepError, preparePages } from "@/lib/upload/prepare";
import { saveAssignment, startSession, useSampleTest } from "./actions";

type Status = { kind: "idle" } | { kind: "working"; message: string } | { kind: "error"; message: string };

export function UploadForm({ defaultNickname = "" }: { defaultNickname?: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const working = status.kind === "working";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const studentNickname = String(form.get("nickname") ?? "").trim();
    const assignmentName = String(form.get("assignment") ?? "").trim();
    if (!studentNickname) return setStatus({ kind: "error", message: "Enter the student's nickname." });
    if (!files.length) return setStatus({ kind: "error", message: "Choose the photos or PDF of the graded test." });

    let sessionId: string | undefined;
    try {
      setStatus({ kind: "working", message: "Starting the session…" });
      const started = await startSession(studentNickname, assignmentName);
      if ("error" in started) throw new PrepError(started.error);
      sessionId = started.sessionId;

      const pages = await preparePages(files, (done, total) =>
        setStatus({ kind: "working", message: `Preparing photos (${Math.min(done + 1, total)} of ${total})…` }),
      );
      for (const [i, page] of pages.entries()) {
        setStatus({ kind: "working", message: `Uploading page ${i + 1} of ${pages.length}…` });
        const res = await fetch(`/api/sessions/${sessionId}/pages/${i + 1}`, {
          method: "POST",
          headers: { "Content-Type": "image/jpeg" },
          body: page.blob,
        });
        if (!res.ok) throw new PrepError(`Page ${i + 1} (${page.label}) didn't upload. Check your connection and try again.`);
      }
      setStatus({ kind: "working", message: "Saving…" });
      const result = await saveAssignment({
        sessionId,
        studentNickname,
        assignmentName,
        pageCount: pages.length,
      });
      if ("error" in result) throw new PrepError(result.error);
      sessionId = result.sessionId;
    } catch (e) {
      const message = e instanceof PrepError ? e.message : "Something went wrong. Please try again.";
      setStatus({ kind: "error", message });
      return;
    }
    // Saved: only now leave the page, outside the clean-up above.
    router.push(`/sessions/${sessionId}/questions`);
  }

  return (
    <div className="grid gap-5">
      <form onSubmit={onSubmit} className="grid gap-5">
        <Notice title="Before you take photos">
          Cover the student&apos;s name and any other personal details on the page. Take photos in good light, from
          straight above; faint pencil is the hardest thing for the app to read.
        </Notice>

        <TextField
          label="Student nickname"
          name="nickname"
          required
          maxLength={40}
          autoComplete="off"
          defaultValue={defaultNickname}
          hint="A first name or nickname only. It appears on the practice sheet and rewards."
          disabled={working}
        />
        <TextField
          label="Assignment name (optional)"
          name="assignment"
          maxLength={120}
          autoComplete="off"
          placeholder="e.g. Topic 10 quiz"
          disabled={working}
        />

        <div className="grid gap-2">
          <label htmlFor="files" className="text-sm font-medium text-ink">
            Graded test
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
          <p className="text-sm text-ink-muted">
            Photos, screenshots or a PDF; up to {MAX_FILES} files. Pages can be in any order or rotated.
          </p>
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
          {working ? "Working…" : "Upload and continue"}
        </Button>
      </form>

      <div className="rounded-control border border-line bg-surface-muted p-4">
        <p className="mb-2 text-sm text-ink-muted">No photo handy? Try the bundled sample test.</p>
        <form action={useSampleTest}>
          <Button variant="secondary" type="submit">
            Use the sample test
          </Button>
        </form>
      </div>
    </div>
  );
}
