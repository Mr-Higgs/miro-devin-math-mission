// Anthropic Messages provider. Images become base64 `image` blocks; the
// system prompt carries the instructions; "Return only JSON" is appended to
// the user turn.
import { AiError, RetryableAiError, type AiProvider, type AiReply } from "./types";

const DEFAULT_MODEL = "claude-sonnet-4-5";

export const anthropic: AiProvider = {
  name: "anthropic",
  async ask({ model = DEFAULT_MODEL, instructions, parts, thinkingLevel, timeoutMs = 220_000 }): Promise<AiReply> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new AiError("The AI key isn't set up (ANTHROPIC_API_KEY).");

    const content = [
      ...parts.map((p) =>
        "text" in p
          ? { type: "text" as const, text: p.text }
          : { type: "image" as const, source: { type: "base64" as const, media_type: p.image.mediaType, data: p.image.base64 } },
      ),
      { type: "text" as const, text: "Return only JSON." },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        model,
        max_tokens: thinkingLevel === "high" ? 16000 : 8000,
        system: instructions,
        messages: [{ role: "user", content }],
      }),
    }).catch((e) => {
      if (e?.name === "TimeoutError") throw new AiError("The AI took too long to answer.");
      throw new RetryableAiError("Couldn't reach the AI service.");
    });

    const body = await res.json().catch(() => null);
    if (res.status === 429 || res.status >= 500) throw new RetryableAiError(`The AI service is busy (${res.status}). Try again in a minute.`);
    if (!res.ok) throw new AiError(`The AI service returned an error (${res.status}): ${body?.error?.message ?? "request failed"}`);
    const text = (body?.content ?? []).map((b: { type: string; text?: string }) => (b.type === "text" ? (b.text ?? "") : "")).join("");
    if (!text) throw new AiError("The AI gave an empty answer.");
    const usage = body?.usage ?? {};
    return { text, inputTokens: usage.input_tokens ?? 0, outputTokens: usage.output_tokens ?? 0 };
  },
};
