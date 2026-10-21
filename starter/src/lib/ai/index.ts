// The AI provider, chosen by AI_PROVIDER (default "mock" — everything works
// with no keys). AI_MODEL overrides each provider's default model.
import "server-only";
import { anthropic } from "./anthropic";
import { gemini } from "./gemini";
import { mock } from "./mock";
import { openai } from "./openai";
import type { AiPart, AiProvider, AskOptions, ImageDetail, ThinkingLevel } from "./types";

export { AiError, parseJsonReply } from "./types";
export type { AiPart, AskOptions, ImageDetail, ThinkingLevel };

const providers: Record<string, AiProvider> = { gemini, anthropic, openai, mock };

const chosen = providers[process.env.AI_PROVIDER ?? "mock"] ?? mock;

const modelOverride = process.env.AI_MODEL;

/** The provider, with the AI_MODEL env override applied. */
export const ai: AiProvider = {
  name: modelOverride ? `${chosen.name}:${modelOverride}` : chosen.name,
  ask: (options) => chosen.ask(modelOverride ? { ...options, model: modelOverride } : options),
};

/**
 * Reading a test: settings ported from web's benchmarked defaults.
 * Writing practice questions: low thinking (faster, app retries failures).
 */
export const EXTRACTION_SETTINGS: Pick<AskOptions, "imageDetail" | "thinkingLevel"> & { enhance: boolean } = {
  imageDetail: "default",
  thinkingLevel: "default",
  enhance: false,
};
export const GENERATION_SETTINGS: Pick<AskOptions, "thinkingLevel"> = { thinkingLevel: "low" };
