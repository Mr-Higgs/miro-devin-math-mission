// POST /api/sessions/[id]/evaluate: marks the learner's answers (screen 4).
import { evaluateAnswers } from "@/lib/jobs/evaluate-answers";

export const maxDuration = 240;

export async function POST(_request: Request, ctx: RouteContext<"/api/sessions/[id]/evaluate">) {
  const { id } = await ctx.params;
  const outcome = await evaluateAnswers(id);
  return Response.json({ outcome }, { status: outcome === "not_found" ? 404 : 200 });
}
