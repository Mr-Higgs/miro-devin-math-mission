// The provider-agnostic AI contract. Every provider (Gemini, Anthropic,
// OpenAI, mock) implements AiProvider; callers only see `ai.ask(...)`.

export type AiJob = "extraction" | "second_look" | "generation" | "grading";

export type AiPart =
  | { text: string }
  | { image: { mediaType: "image/jpeg" | "image/png"; base64: string } };

/** How closely the AI looks at each photo. More detail = more input tokens. */
export type ImageDetail = "default" | "medium" | "high" | "ultra_high";
/** How much the AI "thinks" before answering. */
export type ThinkingLevel = "default" | "minimal" | "low" | "medium" | "high";

export interface AskOptions {
  job: AiJob;
  instructions: string;
  parts: AiPart[];
  imageDetail?: ImageDetail;
  thinkingLevel?: ThinkingLevel;
  timeoutMs?: number;
  model?: string;
}

export interface AiReply {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export interface AiProvider {
  name: string;
  ask(options: AskOptions): Promise<AiReply>;
}

export class AiError extends Error {}
export class RetryableAiError extends AiError {}

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
