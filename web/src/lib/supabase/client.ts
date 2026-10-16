// Supabase for code that runs in the browser (Client Components).
import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./env";

export function createClient() {
  return createBrowserClient(supabaseUrl(), supabasePublishableKey());
}
