"use server";

import { redirect } from "next/navigation";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { copyWorkPage, isUuid, updateSession } from "@/lib/store";
import { MAX_PAGES } from "@/lib/upload/prepare";

/**
 * Step 4, after the browser has uploaded the work pages: checks they're all on
 * disk and records the count. Grading starts on the review page.
 */
export async function saveWork(
  sessionId: string,
  pageCount: number,
): Promise<{ ok: true } | { error: string }> {
  if (!isUuid(sessionId)) return { error: "Something went wrong. Please start again." };
  if (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > MAX_PAGES) {
    return { error: "Something went wrong with the pages. Please start again." };
  }
  const dir = path.join(process.env.DATA_DIR ?? path.join(process.cwd(), "data"), "sessions", sessionId, "work");
  const found = existsSync(dir) ? (await readdir(dir)).filter((f) => /^page-\d+\.jpg$/.test(f)).length : 0;
  if (found < pageCount) return { error: "Some pages didn't finish uploading. Please try again." };

  await updateSession(sessionId, (s) => ({
    ...s,
    work: { ...s.work, page_count: pageCount, grading_status: "none" },
  }));
  return { ok: true };
}

/** Demo path: the bundled sample test stands in as the finished work. */
export async function useSampleWork(sessionId: string): Promise<never> {
  if (!isUuid(sessionId)) redirect("/");
  const from = path.join(process.cwd(), "fixtures", "sample-test.jpg");
  await copyWorkPage(sessionId, 1, from);
  await updateSession(sessionId, (s) => ({
    ...s,
    work: { ...s.work, page_count: 1, grading_status: "none" },
  }));
  redirect(`/sessions/${sessionId}/review`);
}
