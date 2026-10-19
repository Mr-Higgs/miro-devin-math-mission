"use server";

import { redirect } from "next/navigation";
import { getAdult } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MAX_PAGES } from "@/lib/upload/prepare";
import { UPLOADS_BUCKET, assignmentFolder, assignmentPagePath, isUuid } from "@/lib/upload/paths";

export interface NewAssignment {
  assignmentId: string;
  studentNickname: string;
  assignmentName: string;
  pageCount: number;
}

/**
 * Step 1, after the browser has uploaded the cleaned pages: checks they're all
 * there, then saves the assignment, its pages and a new session.
 */
export async function saveAssignment(input: NewAssignment): Promise<{ sessionId: string } | { error: string }> {
  const adult = await getAdult();
  if (!adult) redirect("/login");
  if (!adult.onboarded) redirect("/welcome");

  const nickname = input.studentNickname.trim();
  const name = input.assignmentName.trim();
  if (nickname.length < 1 || nickname.length > 40) return { error: "Enter a nickname of up to 40 characters." };
  if (name.length > 120) return { error: "Keep the assignment name under 120 characters." };
  if (!isUuid(input.assignmentId)) return { error: "Something went wrong. Please start again." };
  if (!Number.isInteger(input.pageCount) || input.pageCount < 1 || input.pageCount > MAX_PAGES) {
    return { error: "Something went wrong with the pages. Please start again." };
  }

  const supabase = await createClient();
  const storage = supabase.storage.from(UPLOADS_BUCKET);
  const pages = Array.from({ length: input.pageCount }, (_, i) => assignmentPagePath(adult.id, input.assignmentId, i + 1));

  // Every page must be in this adult's folder before anything is saved.
  const { data: listed, error: listError } = await storage.list(assignmentFolder(adult.id, input.assignmentId), { limit: 100 });
  const found = new Set((listed ?? []).map((f) => f.name));
  if (listError || pages.some((p) => !found.has(p.split("/").pop()!))) {
    return { error: "Some pages didn't finish uploading. Please try again." };
  }

  try {
    const { error: assignmentError } = await supabase.from("assignments").insert({
      id: input.assignmentId,
      student_nickname: nickname,
      assignment_name: name || null,
    });
    if (assignmentError) throw assignmentError;

    const { error: pagesError } = await supabase.from("assignment_pages").insert(
      pages.map((file_path, i) => ({
        assignment_id: input.assignmentId,
        page_order: i + 1,
        file_path,
        file_type: "image/jpeg",
      })),
    );
    if (pagesError) throw pagesError;

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({ assignment_id: input.assignmentId })
      .select("id")
      .single();
    if (sessionError) throw sessionError;
    // The browser moves to the session page. (A redirect here would reach the
    // upload form's error handling, which would delete the uploaded pages.)
    return { sessionId: session.id };
  } catch {
    // Undo: the assignment row (pages cascade) and the uploaded files.
    await supabase.from("assignments").delete().eq("id", input.assignmentId);
    await storage.remove(pages);
    return { error: "The upload couldn't be saved. Please try again." };
  }
}
