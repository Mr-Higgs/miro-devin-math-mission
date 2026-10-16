import Anthropic from "@anthropic-ai/sdk";
import type { CallResult, ImageInput } from "../common.js";

let client: Anthropic | undefined;

export async function callAnthropic(
  model: string,
  system: string,
  images: ImageInput[],
  userText: string,
): Promise<CallResult> {
  client ??= new Anthropic();
  const content: Anthropic.ContentBlockParam[] = [];
  for (const img of images) {
    content.push({ type: "text", text: img.label });
    content.push({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } });
  }
  content.push({ type: "text", text: userText });

  const started = Date.now();
  // Thinking is adaptive by default on current models. No refusal fallback on purpose:
  // the benchmark must measure the named model, not a substitute.
  const response = await client.messages.create({
    model,
    max_tokens: 16000,
    system,
    output_config: { effort: "high" },
    messages: [{ role: "user", content }],
  });
  if (response.stop_reason === "refusal") throw new Error(`Refused (${response.stop_details?.category ?? "no category"})`);

  const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
  return {
    text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    ms: Date.now() - started,
  };
}
