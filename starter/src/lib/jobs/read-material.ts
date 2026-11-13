// Screen 2's job: read the pasted text and/or page photos and pull out a
// title, a summary and 2–8 key ideas. Retries with the check problems up to
// MAX_TRIES times, then marks the material failed (the page offers Try again).
import "server-only";
import { READ_MATERIAL_INSTRUCTIONS, readMaterialRequest } from "@/prompts/read-material";
import { AiError, ai, parseJsonReply, type AiPart } from "@/lib/ai";
import { checkMaterial } from "@/lib/checks";
import { getSession, isUuid, readPage, updateSession } from "@/lib/store";
import { MAX_TRIES, claimable, retryFeedback, type JobOutcome } from "./job";

const MAX_TEXT = 20_000;
const MAX_PAGES = 20;

export async function readMaterial(sessionId: string): Promise<JobOutcome> {
  if (!isUuid(sessionId)) return "not_found";
  const session = await getSession(sessionId);
  if (!session) return "not_found";

  const { material } = session;
  if (!claimable(material.status, material.started_at)) return "busy";
  const text = (material.text ?? "").slice(0, MAX_TEXT);
  const pageCount = Math.min(material.page_count, MAX_PAGES);
  if (!text && !pageCount) return "failed";

  try {
    await updateSession(sessionId, (s) => ({
      ...s,
      material: { ...s.material, status: "working", started_at: new Date().toISOString(), error: null },
    }));

    const pages: AiPart[] = [];
    for (let n = 1; n <= pageCount; n++) {
      const buf = await readPage(sessionId, n);
      pages.push({ image: { mediaType: "image/jpeg", base64: buf.toString("base64") } });
    }

    let problems: string[] = [];
    for (let tries = 1; tries <= MAX_TRIES; tries++) {
      const parts: AiPart[] = [
        { text: readMaterialRequest({ hasText: !!text, pageCount }) + (problems.length ? retryFeedback(problems) : "") },
      ];
      if (text) parts.push({ text: `Material text:\n${text}` });
      parts.push(...pages);
      try {
        const reply = await ai.ask({ job: "read_material", instructions: READ_MATERIAL_INSTRUCTIONS, parts });
        const parsed = checkMaterial(parseJsonReply(reply.text));
        if (parsed.ok && parsed.value) {
          await updateSession(sessionId, (s) => ({
            ...s,
            material: {
              ...s.material,
              status: "ready",
              title: parsed.value!.title,
              summary: parsed.value!.summary,
              key_ideas: parsed.value!.key_ideas.map((k, i) => ({ id: `k${i + 1}`, ...k })),
            },
          }));
          return "ready";
        }
        problems = parsed.problems;
      } catch (e) {
        if (!(e instanceof AiError)) throw e;
        problems = ["The reply couldn't be used. Return only the JSON described."];
      }
    }
    throw new AiError(`The material couldn't be read: ${problems.join(" ") || "no usable answer"}`);
  } catch (e) {
    const message = e instanceof AiError ? e.message : "Something went wrong while reading the material.";
    await updateSession(sessionId, (s) => ({ ...s, material: { ...s.material, status: "failed", error: message } }));
    return "failed";
  }
}
