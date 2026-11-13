"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TERMS_VERSION } from "@/lib/terms";

export type WelcomeState = { ageError?: string; termsError?: string; error?: string };

/** Records the 18+ confirmation and terms acceptance (decision 011). */
export async function confirmAdult(_prev: WelcomeState, formData: FormData): Promise<WelcomeState> {
  const state: WelcomeState = {};
  if (formData.get("age") !== "yes") state.ageError = "Math Mission is only for adults 18 and older.";
  if (formData.get("terms") !== "yes") state.termsError = "Please accept the terms to continue.";
  if (state.ageError || state.termsError) return state;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login");

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({ age_confirmed_at: now, terms_accepted_at: now, terms_version: TERMS_VERSION })
    .eq("id", data.claims.sub);
  if (error) return { error: "Something went wrong saving that. Please try again." };

  redirect("/");
}
