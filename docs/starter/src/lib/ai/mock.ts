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

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?,;:'"]+$/g, "");

const words = (s: string) => normalize(s).split(" ").filter((w) => w.length >= 3);

/**
 * A believable result for one answer: exact/contained match → "right";
 * at least half the model answer's words present → "almost"; else "not_yet".
 */
function heuristicResult(model: string, learner: string): "right" | "almost" | "not_yet" {
  const m = normalize(model);
  const l = normalize(learner);
  if (l && m && (l === m || l.includes(m) || m.includes(l))) return "right";
  const mw = words(model);
  if (mw.length) {
    const lw = new Set(words(learner));
    const hits = mw.filter((w) => lw.has(w)).length;
    if (hits >= Math.ceil(mw.length / 2)) return "almost";
  }
  return "not_yet";
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
        const { items, summary, next_steps } = JSON.parse(await fixture("evaluate-answers.json")) as {
          items: { result: string; feedback: string }[];
          summary: string;
          next_steps: string[];
        };
        if (!items?.length) throw new AiError("Mock provider: fixtures/evaluate-answers.json has no items.");

        // Mark what was actually asked: parse "Questions to mark: [...]" out of
        // the request, grade with the heuristic, and pick feedback from the
        // first fixture item with the same result (cyclic text otherwise).
        const m = /Questions to mark:\s*(\[[\s\S]*?\])\s*Already graded/.exec(text);
        let toMark: { question_id?: string; model_answer?: string; learner_answer?: string }[] = [];
        try {
          toMark = m ? (JSON.parse(m[1]) as typeof toMark) : [];
        } catch {
          toMark = [];
        }
        const out = toMark.length
          ? toMark.map((q, i) => {
              const result = heuristicResult(q.model_answer ?? "", q.learner_answer ?? "");
              const feedback = items.find((it) => it.result === result)?.feedback ?? items[i % items.length].feedback;
              return { question_id: q.question_id, result, feedback };
            })
          : [...text.matchAll(/"question_id":\s*"([^"]+)"/g)].map((mm, i) => ({
              question_id: mm[1],
              ...items[i % items.length],
            }));

        return {
          text: JSON.stringify({ items: out, summary, next_steps }),
          inputTokens: 0,
          outputTokens: 0,
        };
      }
    }
  },
};
