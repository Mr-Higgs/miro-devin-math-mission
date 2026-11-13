// POST /api/sessions/[id]/read: reads the study material (screen 2).
import { readMaterial } from "@/lib/jobs/read-material";

export const maxDuration = 240;

export async function POST(_request: Request, ctx: RouteContext<"/api/sessions/[id]/read">) {
  const { id } = await ctx.params;
  const outcome = await readMaterial(id);
  return Response.json({ outcome }, { status: outcome === "not_found" ? 404 : 200 });
}
