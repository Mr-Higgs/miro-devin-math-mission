import type { CallResult, ImageInput } from "../common.js";

// Gemini generateContent over plain HTTPS.
export async function callGoogle(
  model: string,
  system: string,
  images: ImageInput[],
  userText: string,
): Promise<CallResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const parts: object[] = [];
  for (const img of images) {
    parts.push({ text: img.label });
    parts.push({ inlineData: { mimeType: img.mediaType, data: img.base64 } });
  }
  parts.push({ text: userText });

  const started = Date.now();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );
  const body: any = await res.json();
  if (!res.ok) throw new Error(`Google ${res.status}: ${body?.error?.message ?? "request failed"}`);

  const text = (body.candidates?.[0]?.content?.parts ?? [])
    .map((p: any) => p.text ?? "")
    .join("");
  return {
    text,
    inputTokens: body.usageMetadata?.promptTokenCount,
    // Thinking tokens are billed as output but reported separately.
    outputTokens: (body.usageMetadata?.candidatesTokenCount ?? 0) + (body.usageMetadata?.thoughtsTokenCount ?? 0),
    ms: Date.now() - started,
  };
}
