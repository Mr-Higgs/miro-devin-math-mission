// The Gemini call itself, shared by the app (through gemini.ts) and the
// benchmark, so both send exactly the same request. No "server-only" import
// here because the benchmark runs outside Next.js; never import this from
// browser code (it needs the secret API key).

export type AiPart = { text: string } | { image: { mediaType: "image/jpeg" | "image/png"; base64: string } };

/** How closely the AI looks at each photo. More detail = more input tokens (cost). */
export type ImageDetail = "default" | "medium" | "high" | "ultra_high";
/** How much the AI "thinks" before answering. Thinking is billed as output tokens. */
export type ThinkingLevel = "default" | "minimal" | "low" | "medium" | "high";

export interface AskOptions {
  model: string;
  apiKey: string | undefined;
  instructions: string;
  parts: AiPart[];
  imageDetail?: ImageDetail;
  thinkingLevel?: ThinkingLevel;
  timeoutMs?: number;
}

export interface AiReply {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export class AiError extends Error {}
class RetryableAiError extends AiError {}

/** Sends the request; a dropped connection or a busy service gets one more try. */
export async function askGemini(options: AskOptions): Promise<AiReply> {
  try {
    return await askOnce(options);
  } catch (e) {
    if (!(e instanceof RetryableAiError)) throw e;
    await new Promise((r) => setTimeout(r, 2000));
    return askOnce(options);
  }
}

async function askOnce({ model, apiKey, instructions, parts, imageDetail = "default", thinkingLevel = "default", timeoutMs = 220_000 }: AskOptions): Promise<AiReply> {
  if (!apiKey) throw new AiError("The AI key isn't set up (GEMINI_API_KEY).");
  const resolution = imageDetail === "default" ? undefined : { level: `MEDIA_RESOLUTION_${imageDetail.toUpperCase()}` };

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instructions }] },
      contents: [
        {
          role: "user",
          parts: parts.map((p) =>
            "text" in p
              ? { text: p.text }
              : { inlineData: { mimeType: p.image.mediaType, data: p.image.base64 }, ...(resolution && { mediaResolution: resolution }) },
          ),
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        ...(thinkingLevel !== "default" && { thinkingConfig: { thinkingLevel } }),
      },
    }),
  }).catch((e) => {
    if (e?.name === "TimeoutError") throw new AiError("The AI took too long to answer.");
    throw new RetryableAiError("Couldn't reach the AI service.");
  });

  const body = await res.json().catch(() => null);
  if (res.status === 429 || res.status >= 500) throw new RetryableAiError(`The AI service is busy (${res.status}). Try again in a minute.`);
  if (!res.ok) throw new AiError(`The AI service returned an error (${res.status}): ${body?.error?.message ?? "request failed"}`);
  const text = (body?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
  if (!text) throw new AiError("The AI gave an empty answer.");
  const usage = body?.usageMetadata ?? {};
  return {
    text,
    inputTokens: usage.promptTokenCount ?? 0,
    // Thinking tokens are billed as output but reported separately.
    outputTokens: (usage.candidatesTokenCount ?? 0) + (usage.thoughtsTokenCount ?? 0),
  };
}

/** Pulls the first JSON object out of a reply (tolerates code fences or stray text). */
export function parseJsonReply(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new AiError("The AI's answer wasn't in the expected form.");
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new AiError("The AI's answer wasn't in the expected form.");
  }
}
