// Runs before every page request (Next.js 16 calls this file "proxy"; older
// versions called it "middleware"). It only keeps the login fresh. Who may see
// what is checked on each page (src/lib/auth.ts) and by the database's rules.
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip build files, images and the health check.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
