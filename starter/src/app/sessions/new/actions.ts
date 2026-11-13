"use server";

import { redirect } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createSession, isUuid, pageCountOnDisk, updateSession } from "@/lib/store";
import { MAX_PAGES } from "@/lib/upload/prepare";

const MAX_TEXT = 20_000;

/** Creates the session shell so the browser has somewhere to upload pages to. */
export async function startSession(): Promise<{ sessionId: string } | { error: string }> {
  const session = await createSession({ kind: "text", title: "", text: null, pageCount: 0 });
  return { sessionId: session.id };
}

/** After any pages are uploaded: records the material so the reading can start. */
export async function saveMaterial(input: {
  sessionId: string;
  text: string;
  pageCount: number;
}): Promise<{ ok: true } | { error: string }> {
  if (!isUuid(input.sessionId)) return { error: "Something went wrong. Please start again." };
  const text = input.text.trim().slice(0, MAX_TEXT);
  if (!Number.isInteger(input.pageCount) || input.pageCount < 0 || input.pageCount > MAX_PAGES) {
    return { error: "Something went wrong with the pages. Please start again." };
  }
  if (!text && !input.pageCount) return { error: "Add some text or upload a photo or PDF first." };
  if (input.pageCount && (await pageCountOnDisk(input.sessionId)) < input.pageCount) {
    return { error: "Some pages didn't finish uploading. Please try again." };
  }

  try {
    await updateSession(input.sessionId, (s) => ({
      ...s,
      material: {
        ...s.material,
        kind: input.pageCount ? "pages" : "text",
        text: text || null,
        page_count: input.pageCount,
      },
    }));
  } catch {
    return { error: "Something went wrong. Please start again." };
  }
  return { ok: true };
}

/** Demo path: builds a session from the bundled sample material. */
export async function useSample(): Promise<never> {
  const text = await readFile(path.join(process.cwd(), "fixtures", "sample-material.md"), "utf8");
  const session = await createSession({ kind: "text", title: "Sample material", text });
  redirect(`/sessions/${session.id}/material`);
}
