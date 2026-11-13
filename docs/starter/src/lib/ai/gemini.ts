// Google Gemini provider (adapted from web/src/lib/ai/gemini-core.ts).
import { AiError, RetryableAiError, type AiProvider, type AskOptions, type AiReply } from "./types";

const DEFAULT_MODEL = "gemini-3.8-flash";

async function askOnce({
  model = DEFAULT_MODEL,
  instructions,
  parts,
  imageDetail = "default",
  thinkingLevel = "default",
  timeoutMs = 220_000,
}: AskOptions): Promise<AiReply> {
  const apiKey = process.env.GEMINI_API_KEY;
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
    outputTokens: (usage.candidatesTokenCount ?? 0) + (usage.thoughtsTokenCount ?? 0),
  };
}

export const gemini: AiProvider = {
  name: "gemini",
  async ask(options) {
    try {
      return await askOnce(options);
    } catch (e) {
      if (!(e instanceof RetryableAiError)) throw e;
      await new Promise((r) => setTimeout(r, 2000));
      return askOnce(options);
    }
  },
};
