"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { basePath } from "@/config/base-path";

export type LoginState =
  | { step: "email"; error?: string }
  | { step: "code"; email: string; error?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Emails a sign-in link to an invited adult (decision 001; invites are added
 * with `npm run invite`). The link lands on /auth/callback.
 *
 * The same form also accepts a code typed from the email. Supabase's email
 * shows only the link until the app has its own email service (Phase 3);
 * then the email template adds the code, which works on any device.
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (formData.get("restart")) return { step: "email" };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { step: "email", error: "Enter a valid email address." };

  const supabase = await createClient();
  const code = formData.get("code");

  if (code === null || formData.get("resend")) {
    // shouldCreateUser: false = never makes a new account. The reply is the
    // same whether or not the email is invited, so the page doesn't reveal
    // who has an account.
    const origin = (await headers()).get("origin");
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: origin ? `${origin}${basePath}/auth/callback` : undefined },
    });
    return { step: "code", email };
  }

  const token = String(code).replace(/\s/g, "");
  if (!/^\d{6,10}$/.test(token)) {
    return { step: "code", email, error: "Enter the code from the email (numbers only)." };
  }

  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) {
    return { step: "code", email, error: "That code didn't work or has expired. Check it, or send a new one." };
  }

  redirect("/welcome");
}
