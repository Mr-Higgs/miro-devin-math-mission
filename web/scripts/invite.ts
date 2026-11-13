// Invite-only access (decision 001): adds an adult who may sign in.
// Run from web/:
//   npm run invite -- someone@example.com    add an adult
//   npm run invite -- --list                 list everyone who can sign in
// Only invite adults (18+, decision 011). No email is sent: tell them to go to
// the site and sign in with this address; they'll get a code by email.
// Uses the secret key from web/.env.local, so it only runs on this Mac.
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

const SITE = (process.env.SITE_URL ?? "https://math-mission-wheat.vercel.app").replace(/\/$/, "");

async function main() {
  loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY is missing from web/.env.local");

  const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } }).auth.admin;
  const arg = process.argv[2]?.trim().toLowerCase();

  if (!arg || arg === "--list") {
    const { data, error } = await admin.listUsers({ perPage: 200 });
    if (error) throw error;
    console.log(data.users.length ? "Can sign in:" : "No one has been invited yet.");
    for (const u of data.users) {
      console.log(`  ${u.email}  (added ${u.created_at.slice(0, 10)}, last sign-in ${u.last_sign_in_at?.slice(0, 10) ?? "never"})`);
    }
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(arg)) throw new Error(`"${arg}" doesn't look like an email address`);

  const { error } = await admin.createUser({ email: arg, email_confirm: true });
  if (error && /already/i.test(error.message)) {
    console.log(`${arg} is already invited.`);
    return;
  }
  if (error) throw error;
  console.log(`Invited ${arg}. Tell them to go to ${SITE}/login and sign in with this email.`);
}

main().catch((e) => {
  console.error(`Couldn't finish: ${e.message ?? e}`);
  process.exit(1);
});
