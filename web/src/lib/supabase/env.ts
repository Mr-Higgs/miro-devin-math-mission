// Supabase settings come from web/.env.local (on this Mac) and from Vercel's
// Environment Variables (on the live site). Values are never written in code.
//
// The URL and publishable key are safe in the browser: the database's row-level
// security rules decide what they can reach. The secret key is not, so it has
// no NEXT_PUBLIC_ prefix and is read only in server-only files.

export function supabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

// Either the anon key (legacy) or the publishable key works here; both are the
// public client key. The anon key is what the project uses today.
export function supabasePublishableKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

// NEXT_PUBLIC_ values must be read by their full name (process.env.NAME) so
// Next.js can copy them into the browser code at build time; that's why the
// value is passed in rather than looked up here.
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is missing. Add it to web/.env.local and to Vercel's Environment Variables.`);
  }
  return value;
}
