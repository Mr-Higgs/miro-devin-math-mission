// POST /api/sessions/[id]/extract: reads the uploaded test (Step 2).
// Called by the Step 2 page while it shows "Reading the test…". Six photos took
// about 70 seconds in the benchmark, so this route may run for 4 minutes
// (Vercel's free plan allows up to 5).
import { getAdult } from "@/lib/auth";
import { runExtraction } from "@/lib/extraction";

export const maxDuration = 240;

export async function POST(_request: Request, ctx: RouteContext<"/api/sessions/[id]/extract">) {
  const adult = await getAdult();
  if (!adult?.onboarded) return Response.json({ outcome: "signed_out" }, { status: 401 });

  const { id } = await ctx.params;
  const outcome = await runExtraction(id);
  return Response.json({ outcome }, { status: outcome === "not_found" ? 404 : 200 });
}
