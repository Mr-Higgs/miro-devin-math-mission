// Supabase for code that runs on the server (Server Components, Server
// Functions, Route Handlers). It acts as the signed-in adult, using their login
// cookies, so row-level security applies.
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can't set cookies. That's fine once proxy.ts
          // refreshes the login on each request (added with the login step).
        }
      },
    },
  });
}
