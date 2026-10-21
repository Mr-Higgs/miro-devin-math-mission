// OpenAI Chat Completions provider. Images become `image_url` data URLs;
// replies are constrained to JSON objects.
import { AiError, RetryableAiError, type AiProvider, type AiReply } from "./types";

const DEFAULT_MODEL = "gpt-5-mini";

export const openai: AiProvider = {
  name: "openai",
  async ask({ model = DEFAULT_MODEL, instructions, parts, timeoutMs = 220_000 }): Promise<AiReply> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new AiError("The AI key isn't set up (OPENAI_API_KEY).");

    const content = parts.map((p) =>
      "text" in p
        ? { type: "text" as const, text: p.text }
        : { type: "image_url" as const, image_url: { url: `data:${p.image.mediaType};base64,${p.image.base64}` } },
    );

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: instructions },
          { role: "user", content },
        ],
      }),
    }).catch((e) => {
      if (e?.name === "TimeoutError") throw new AiError("The AI took too long to answer.");
      throw new RetryableAiError("Couldn't reach the AI service.");
    });

    const body = await res.json().catch(() => null);
    if (res.status === 429 || res.status >= 500) throw new RetryableAiError(`The AI service is busy (${res.status}). Try again in a minute.`);
    if (!res.ok) throw new AiError(`The AI service returned an error (${res.status}): ${body?.error?.message ?? "request failed"}`);
    const text = body?.choices?.[0]?.message?.content ?? "";
    if (!text) throw new AiError("The AI gave an empty answer.");
    const usage = body?.usage ?? {};
    return { text, inputTokens: usage.prompt_tokens ?? 0, outputTokens: usage.completion_tokens ?? 0 };
  },
};
