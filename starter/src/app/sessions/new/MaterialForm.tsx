"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Notice } from "@/components/ui";
import { mission } from "@mission";
import { MAX_FILES, MAX_PAGES, PrepError, preparePages } from "@/lib/upload/prepare";
import { saveMaterial, startSession } from "./actions";

const ACCEPTS: Record<string, string> = {
  photo: "image/jpeg,image/png,image/webp,image/heic,image/heif",
  pdf: "application/pdf",
};

type Status = { kind: "idle" } | { kind: "working"; message: string } | { kind: "error"; message: string };

export function MaterialForm({ kinds }: { kinds: string[] }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const working = status.kind === "working";
  const allowText = kinds.includes("text");
  const fileKinds = kinds.filter((k) => k !== "text");
  const accept = fileKinds.flatMap((k) => (ACCEPTS[k] ?? "").split(",")).filter(Boolean).join(",");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = String(form.get("text") ?? "").trim();
    if (!text && !files.length) {
      return setStatus({ kind: "error", message: "Add some text or choose a photo or PDF first." });
    }

    let sessionId: string | undefined;
    try {
      setStatus({ kind: "working", message: "Starting the session…" });
      const started = await startSession();
      if ("error" in started) throw new PrepError(started.error);
      sessionId = started.sessionId;

      let pageCount = 0;
      if (files.length) {
        const pages = await preparePages(files, (done, total) =>
          setStatus({ kind: "working", message: `Preparing files (${Math.min(done + 1, total)} of ${total})…` }),
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
        pageCount = pages.length;
      }

      setStatus({ kind: "working", message: "Saving…" });
      const saved = await saveMaterial({ sessionId, text, pageCount });
      if ("error" in saved) throw new PrepError(saved.error);
    } catch (e) {
      const message = e instanceof PrepError ? e.message : "Something went wrong. Please try again.";
      setStatus({ kind: "error", message });
      return;
    }
    router.push(`/sessions/${sessionId}/material`);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {allowText && (
        <div className="grid gap-2">
          <label htmlFor="text" className="text-sm font-medium text-ink">
            {mission.material.prompt}
          </label>
          <textarea
            id="text"
            name="text"
            rows={7}
            disabled={working}
            placeholder={mission.material.examples}
            className="rounded-control border border-line bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-accent"
          />
          <p className="text-sm text-ink-muted">{mission.material.examples}</p>
        </div>
      )}

      {fileKinds.length > 0 && (
        <div className="grid gap-2">
          <label htmlFor="files" className="text-sm font-medium text-ink">
            {allowText ? "…or upload" : mission.material.prompt}
          </label>
          <input
            id="files"
            type="file"
            multiple
            accept={accept}
            disabled={working}
            onChange={(e) => {
              setFiles(Array.from(e.target.files ?? []).slice(0, MAX_FILES));
              setStatus({ kind: "idle" });
            }}
            className="rounded-control border border-dashed border-line bg-surface-muted p-4 text-sm text-ink file:mr-3 file:rounded-control file:border-0 file:bg-accent file:px-3 file:py-2 file:text-accent-ink"
          />
          <p className="text-sm text-ink-muted">
            {[
              fileKinds.includes("photo") ? "photos or screenshots" : "",
              fileKinds.includes("pdf") ? "a PDF" : "",
            ]
              .filter(Boolean)
              .join(" or ")}
            ; up to {MAX_FILES} files, {MAX_PAGES} pages total.
          </p>
          {files.length > 0 && (
            <ul className="text-sm text-ink-muted">
              {files.map((f) => (
                <li key={f.name + f.size}>• {f.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {status.kind === "error" && <Notice tone="danger">{status.message}</Notice>}
      {status.kind === "working" && <Notice>{status.message}</Notice>}

      <Button type="submit" size="lg" disabled={working}>
        {working ? "Working…" : "Continue"}
      </Button>
    </form>
  );
}
