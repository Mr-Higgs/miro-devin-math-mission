// POST /api/sessions/[id]/practice: writes the practice set (screen 3).
import { generatePractice } from "@/lib/jobs/generate-practice";

export const maxDuration = 240;

export async function POST(_request: Request, ctx: RouteContext<"/api/sessions/[id]/practice">) {
  const { id } = await ctx.params;
  const outcome = await generatePractice(id);
  return Response.json({ outcome }, { status: outcome === "not_found" ? 404 : 200 });
}
