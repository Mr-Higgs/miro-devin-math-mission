// POST /api/sessions/[id]/practice: writes the practice set (Step 3).
// Questions are written 4 at a time with up to 3 tries each, so allow 4 minutes.
import { getAdult } from "@/lib/auth";
import { runPractice } from "@/lib/generation";

export const maxDuration = 240;

export async function POST(_request: Request, ctx: RouteContext<"/api/sessions/[id]/practice">) {
  const adult = await getAdult();
  if (!adult?.onboarded) return Response.json({ outcome: "signed_out" }, { status: 401 });
  const { id } = await ctx.params;
  const outcome = await runPractice(id);
  return Response.json({ outcome }, { status: outcome === "not_found" ? 404 : 200 });
}
