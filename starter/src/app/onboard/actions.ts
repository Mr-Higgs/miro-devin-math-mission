"use server";

import { redirect } from "next/navigation";
import { saveProfile } from "@/lib/store";

/** Saves who the app is for (data/profile.json), then home. */
export async function saveOnboarding(form: FormData): Promise<void> {
  const clean = (key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);
  const learnerName = clean("name", 40);
  if (!learnerName) return;
  await saveProfile({
    learnerName,
    persona: clean("persona", 200),
    topic: clean("topic", 120),
    level: clean("level", 20),
    createdAt: new Date().toISOString(),
  });
  redirect("/");
}
