// POST /api/practice/[gqid]/regenerate: new numbers for one practice question.
import { getAdult } from "@/lib/auth";
import { regenerateOne } from "@/lib/generation";

export const maxDuration = 120;

export async function POST(_request: Request, ctx: RouteContext<"/api/practice/[gqid]/regenerate">) {
  const adult = await getAdult();
  if (!adult?.onboarded) return Response.json({ outcome: "signed_out" }, { status: 401 });
  const { gqid } = await ctx.params;
  const outcome = await regenerateOne(gqid);
  return Response.json({ outcome }, { status: outcome === "not_found" ? 404 : 200 });
}
