// Lists the model IDs each provider account can use, to confirm models.json.
import Anthropic from "@anthropic-ai/sdk";
import { loadEnv } from "./common.js";

loadEnv();

async function anthropicModels(): Promise<string[]> {
  const ids: string[] = [];
  for await (const m of new Anthropic().models.list()) ids.push(m.id);
  return ids;
}

async function openaiModels(): Promise<string[]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` } });
  const body: any = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${body?.error?.message}`);
  return body.data.map((m: any) => m.id).filter((id: string) => /^(gpt|o\d)/.test(id)).sort();
}

async function googleModels(): Promise<string[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", {
    headers: { "x-goog-api-key": key },
  });
  const body: any = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${body?.error?.message}`);
  return body.models
    .filter((m: any) => (m.supportedGenerationMethods ?? []).includes("generateContent"))
    .map((m: any) => String(m.name).replace(/^models\//, ""))
    .filter((id: string) => id.startsWith("gemini"));
}

for (const [name, fn] of [["Anthropic", anthropicModels], ["OpenAI", openaiModels], ["Google", googleModels]] as const) {
  try {
    console.log(`\n${name}:\n  ${(await fn()).join("\n  ")}`);
  } catch (e: any) {
    console.log(`\n${name}: skipped (${e.message})`);
  }
}
