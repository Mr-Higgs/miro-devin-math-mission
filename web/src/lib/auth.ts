// Who is signed in. Every page that shows an adult's data starts here.
// Reads the login cookies, so callers must sit inside a <Suspense> boundary.
import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TERMS_VERSION } from "@/lib/terms";

export type Adult = {
  id: string;
  email: string;
  /** Has confirmed 18+ and accepted the current terms (decision 011). */
  onboarded: boolean;
};

/** The signed-in adult, or null when signed out. */
export async function getAdult(): Promise<Adult | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("age_confirmed_at, terms_accepted_at, terms_version")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    onboarded: Boolean(
      profile?.age_confirmed_at && profile.terms_accepted_at && profile.terms_version === TERMS_VERSION,
    ),
  };
}

/** For pages only signed-in, confirmed adults may see. */
export async function requireAdult(): Promise<Adult> {
  const adult = await getAdult();
  if (!adult) redirect("/login");
  if (!adult.onboarded) redirect("/welcome");
  return adult;
}
