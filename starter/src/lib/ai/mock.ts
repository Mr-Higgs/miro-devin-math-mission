// Mock provider: answers from starter/fixtures/, so the whole flow runs with
// no API key. ~400 ms of latency so the progress UI is visible. When the
// learner, topic or question types change, rewrite the fixtures to match —
// `npm run check` validates them against mission.config.ts.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { AiError, type AiProvider } from "./types";

const FIXTURES = path.join(process.cwd(), "fixtures");

async function fixture(name: string): Promise<string> {
  try {
    return await readFile(path.join(FIXTURES, name), "utf8");
  } catch {
    throw new AiError(`Mock provider: missing fixture fixtures/${name}.`);
  }
}

export const mock: AiProvider = {
  name: "mock",
  async ask({ job, parts }) {
    await new Promise((r) => setTimeout(r, 400));
    const text = parts.map((p) => ("text" in p ? p.text : "")).join("\n");

    switch (job) {
      case "read_material":
        return { text: await fixture("read-material.json"), inputTokens: 0, outputTokens: 0 };
      case "generate_practice":
        return { text: await fixture("generate-practice.json"), inputTokens: 0, outputTokens: 0 };
      case "evaluate_answers": {
        // Apply the fixture's pattern cyclically to the ids actually sent for
        // marking, so the reply is always valid for the questions asked.
        const { items, summary, next_steps } = JSON.parse(await fixture("evaluate-answers.json")) as {
          items: { result: string; feedback: string }[];
          summary: string;
          next_steps: string[];
        };
        if (!items?.length) throw new AiError("Mock provider: fixtures/evaluate-answers.json has no items.");
        const ids = [...text.matchAll(/"question_id":\s*"([^"]+)"/g)].map((m) => m[1]);
        return {
          text: JSON.stringify({
            items: ids.map((id, i) => ({ question_id: id, ...items[i % items.length] })),
            summary,
            next_steps,
          }),
          inputTokens: 0,
          outputTokens: 0,
        };
      }
    }
  },
};
