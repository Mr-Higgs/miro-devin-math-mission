import type { CallResult, ImageInput } from "../common.js";
import { RUN_OPTIONS } from "../common.js";
import { askGemini, type ImageDetail, type ThinkingLevel } from "../../../src/lib/ai/gemini-core.js";
import { enhanceForReading } from "../../../src/lib/ai/enhance.js";

// Gemini through the app's own request code, so the benchmark tests exactly
// what the app sends (including --detail, --thinking and --enhance).
export async function callGoogle(model: string, system: string, images: ImageInput[], userText: string): Promise<CallResult> {
  const parts = [];
  for (const img of images) {
    parts.push({ text: img.label });
    const data = RUN_OPTIONS.enhance && img.mediaType === "image/jpeg"
      ? (await enhanceForReading(Buffer.from(img.base64, "base64"))).toString("base64")
      : img.base64;
    parts.push({ image: { mediaType: img.mediaType, base64: data } });
  }
  parts.push({ text: userText });

  const started = Date.now();
  const reply = await askGemini({
    model,
    apiKey: process.env.GEMINI_API_KEY,
    instructions: system,
    parts,
    imageDetail: RUN_OPTIONS.detail as ImageDetail,
    thinkingLevel: RUN_OPTIONS.thinking as ThinkingLevel,
  });
  return { text: reply.text, inputTokens: reply.inputTokens, outputTokens: reply.outputTokens, ms: Date.now() - started };
}
