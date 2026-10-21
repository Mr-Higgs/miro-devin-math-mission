// POST /api/sessions/[id]/extract: reads the uploaded test (Step 2).
import { runExtraction } from "@/lib/extraction";

export const maxDuration = 240;

export async function POST(_request: Request, ctx: RouteContext<"/api/sessions/[id]/extract">) {
  const { id } = await ctx.params;
  const outcome = await runExtraction(id);
  return Response.json({ outcome }, { status: outcome === "not_found" ? 404 : 200 });
}
