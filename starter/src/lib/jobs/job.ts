// Shared job plumbing: claim a job's status before starting, so two tabs (or
// a retry) don't run it twice. A "working" status older than 5 minutes is
// treated as crashed and may be claimed again.
import type { JobStatus } from "@/lib/store";

export const MAX_TRIES = 3;
const STALE_MS = 5 * 60 * 1000;

export type JobOutcome = "ready" | "failed" | "busy" | "not_found";

export function claimable(status: JobStatus, startedAt: string | null): boolean {
  const at = startedAt ? Date.parse(startedAt) : 0;
  return status === "none" || status === "failed" || (status === "working" && at < Date.now() - STALE_MS);
}

/** Turns failed check problems into the retry message sent back to the AI. */
export function retryFeedback(problems: string[]): string {
  return `\n\nYour previous answer failed the app's checks:\n- ${problems.join("\n- ")}\nReturn a new JSON object that fixes these problems.`;
}
