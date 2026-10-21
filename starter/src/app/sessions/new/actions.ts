"use server";

import { redirect } from "next/navigation";
import path from "node:path";
import {
  copyPage,
  createSession,
  getProfile,
  isUuid,
  pageCountOnDisk,
  updateSession,
} from "@/lib/store";
import { MAX_PAGES } from "@/lib/upload/prepare";

export interface NewAssignment {
  sessionId: string;
  studentNickname: string;
  assignmentName: string;
  pageCount: number;
}

/**
 * Step 1, first call: creates the session so the browser has somewhere to
 * upload pages to. Returns the new session id.
 */
export async function startSession(
  studentNickname: string,
  assignmentName: string,
): Promise<{ sessionId: string } | { error: string }> {
  const nickname = studentNickname.trim();
  const name = assignmentName.trim();
  if (nickname.length < 1 || nickname.length > 40)
    return { error: "Enter a nickname of up to 40 characters." };
  if (name.length > 120) return { error: "Keep the assignment name under 120 characters." };

  const session = await createSession({
    studentNickname: nickname,
    assignmentName: name,
    pageCount: 0,
  });
  return { sessionId: session.id };
}

/**
 * Step 1, after the browser has uploaded the cleaned pages: checks they're
 * all on disk, then records the count so the reading can start.
 */
export async function saveAssignment(input: NewAssignment): Promise<{ sessionId: string } | { error: string }> {
  if (!isUuid(input.sessionId)) return { error: "Something went wrong. Please start again." };
  if (!Number.isInteger(input.pageCount) || input.pageCount < 1 || input.pageCount > MAX_PAGES) {
    return { error: "Something went wrong with the pages. Please start again." };
  }

  const found = await pageCountOnDisk(input.sessionId);
  if (found < input.pageCount) {
    return { error: "Some pages didn't finish uploading. Please try again." };
  }

  await updateSession(input.sessionId, (s) => ({
    ...s,
    assignment: { ...s.assignment, page_count: input.pageCount },
  }));
  return { sessionId: input.sessionId };
}

/** Profile fields for prefilling the form. */
export async function getDefaults(): Promise<{ nickname: string }> {
  const profile = await getProfile();
  return { nickname: profile?.learnerName ?? "" };
}

/**
 * Demo path: builds a session from the bundled sample test so the mock flow
 * needs no photo.
 */
export async function useSampleTest(): Promise<never> {
  const profile = await getProfile();
  const session = await createSession({
    studentNickname: profile?.learnerName ?? "Student",
    assignmentName: "Sample test",
    pageCount: 1,
  });
  const from = path.join(process.cwd(), "fixtures", "sample-test.jpg");
  await copyPage(session.id, 1, from);
  redirect(`/sessions/${session.id}/questions`);
}
