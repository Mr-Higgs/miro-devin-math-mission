// The app's AI settings, server only (decision 007: keys never reach the
// browser). The provider is one setting (decision 002); if the legal review
// (011) rules Gemini out, only this folder changes.
import "server-only";
import { askGemini, type AiPart, type ImageDetail, type ThinkingLevel } from "./gemini-core";

export { AiError, parseJsonReply, type AiPart } from "./gemini-core";

/** Google Gemini 3.8 Flash, chosen by benchmark (decision 002). */
export const AI_MODEL = "gemini-3.8-flash";

/**
 * Reading a test: settings chosen by benchmark (docs/web/benchmark, 2026-10-19;
 * results in docs/cost-optimization.md). Defaults were the most accurate at
 * the lowest cost; the contrast boost and low thinking did worse, and ultra
 * detail cost more for no gain. Change only after re-running the benchmark.
 */
export const EXTRACTION_SETTINGS: { imageDetail: ImageDetail; thinkingLevel: ThinkingLevel; enhance: boolean } = {
  imageDetail: "default",
  thinkingLevel: "default",
  enhance: false,
};

/**
 * Writing practice questions: low thinking (benchmark 2026-10-20: ~2.6 s per
 * question instead of ~12 s, ~85% fewer output tokens; 11/13 passed the math
 * checks on the first try, and the app retries failures automatically).
 */
export const GENERATION_SETTINGS: { thinkingLevel: ThinkingLevel } = { thinkingLevel: "low" };

export async function askAi(
  instructions: string,
  parts: AiPart[],
  settings: { imageDetail?: ImageDetail; thinkingLevel?: ThinkingLevel } = {},
) {
  return askGemini({ model: AI_MODEL, apiKey: process.env.GEMINI_API_KEY, instructions, parts, ...settings });
}
