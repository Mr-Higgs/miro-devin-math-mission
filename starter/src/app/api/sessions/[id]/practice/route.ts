// POST /api/sessions/[id]/practice: writes the practice set (Step 3).
import { runPractice } from "@/lib/generation";

export const maxDuration = 240;

export async function POST(_request: Request, ctx: RouteContext<"/api/sessions/[id]/practice">) {
  const { id } = await ctx.params;
  const outcome = await runPractice(id);
  return Response.json({ outcome }, { status: outcome === "not_found" ? 404 : 200 });
}
