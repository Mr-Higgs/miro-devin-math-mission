// GET /api/health: confirms the app can reach Supabase with its settings.
// Returns only yes/no, never keys or error details from Supabase.
import { connection } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

export async function GET() {
  await connection(); // check on every request, not once at build time

  let supabase: "ok" | "missing settings" | "unreachable" = "ok";
  try {
    const res = await fetch(`${supabaseUrl()}/auth/v1/health`, {
      headers: { apikey: supabasePublishableKey() },
      cache: "no-store",
    });
    if (!res.ok) supabase = "unreachable";
  } catch (error) {
    supabase = error instanceof Error && error.message.includes("is missing") ? "missing settings" : "unreachable";
  }

  return Response.json({ supabase }, { status: supabase === "ok" ? 200 : 503 });
}
