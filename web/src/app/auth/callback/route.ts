// Where the sign-in link in the email lands. Supabase checks the link, then
// sends the browser here with a one-time ?code=, which is swapped for the login
// cookies. This only works in the browser that asked for the link, because the
// swap needs a secret that browser stored when the link was requested.
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const flowId = url.searchParams.get("sb_flow_id");
    const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    if (!error) return NextResponse.redirect(new URL("/welcome", url.origin));
  }

  return NextResponse.redirect(new URL("/login?link=failed", url.origin));
}
