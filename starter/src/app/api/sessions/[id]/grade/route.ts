// POST /api/sessions/[id]/grade: grades the uploaded work (Step 5).
import { runGrading } from "@/lib/run-grading";

export const maxDuration = 240;

export async function POST(_request: Request, ctx: RouteContext<"/api/sessions/[id]/grade">) {
  const { id } = await ctx.params;
  const outcome = await runGrading(id);
  return Response.json({ outcome }, { status: outcome === "not_found" ? 404 : 200 });
}
