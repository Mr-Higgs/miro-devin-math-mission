// /api/sessions/[id]/work-pages/[n]: POST saves a photo of the student's
// finished work; GET streams it back.
import { isUuid, readWorkPage, saveWorkPage } from "@/lib/store";

export async function POST(request: Request, ctx: RouteContext<"/api/sessions/[id]/work-pages/[n]">) {
  const { id, n } = await ctx.params;
  const page = Number(n);
  if (!isUuid(id) || !Number.isInteger(page) || page < 1 || page > 20) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const buf = Buffer.from(await request.arrayBuffer());
  if (!buf.length) return Response.json({ error: "empty" }, { status: 400 });
  await saveWorkPage(id, page, buf);
  return Response.json({ ok: true });
}

export async function GET(_request: Request, ctx: RouteContext<"/api/sessions/[id]/work-pages/[n]">) {
  const { id, n } = await ctx.params;
  const page = Number(n);
  if (!isUuid(id) || !Number.isInteger(page) || page < 1) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const buf = await readWorkPage(id, page);
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/jpeg" } });
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
}
