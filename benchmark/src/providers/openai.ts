import type { CallResult, ImageInput } from "../common.js";

// OpenAI Chat Completions over plain HTTPS. Kept minimal (no temperature or token
// limits) because newer models reject some of those parameters.
export async function callOpenAI(
  model: string,
  system: string,
  images: ImageInput[],
  userText: string,
): Promise<CallResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");

  const content: object[] = [];
  for (const img of images) {
    content.push({ type: "text", text: img.label });
    content.push({ type: "image_url", image_url: { url: `data:${img.mediaType};base64,${img.base64}` } });
  }
  content.push({ type: "text", text: userText });

  const started = Date.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content },
      ],
      response_format: { type: "json_object" },
    }),
  });
  const body: any = await res.json();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${body?.error?.message ?? "request failed"}`);

  return {
    text: body.choices?.[0]?.message?.content ?? "",
    inputTokens: body.usage?.prompt_tokens,
    outputTokens: body.usage?.completion_tokens,
    ms: Date.now() - started,
  };
}
