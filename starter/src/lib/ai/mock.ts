// Mock provider: answers from starter/fixtures/, so the whole flow runs with
// no API key. ~400 ms of latency so the progress UI is visible.
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

/** The missed question's number, parsed out of the generation request. */
function missedQuestionNumber(requestText: string): string | null {
  const m = /Missed question:\s*(\{[\s\S]*\})\s*Write one practice version/.exec(requestText);
  if (!m) return null;
  try {
    const q = JSON.parse(m[1]) as { question_number?: unknown };
    return q.question_number == null ? null : String(q.question_number);
  } catch {
    return null;
  }
}

export const mock: AiProvider = {
  name: "mock",
  async ask({ job, parts }) {
    await new Promise((r) => setTimeout(r, 400));

    const text = parts
      .map((p) => ("text" in p ? p.text : ""))
      .join("\n");

    switch (job) {
      case "extraction":
        return { text: await fixture("extraction.json"), inputTokens: 0, outputTokens: 0 };
      case "second_look":
        return { text: JSON.stringify({ answers: [] }), inputTokens: 0, outputTokens: 0 };
      case "generation": {
        const all = JSON.parse(await fixture("generation.json")) as Record<string, unknown>;
        const number = missedQuestionNumber(text);
        const entry = (number && all[number]) || all.default;
        if (!entry) throw new AiError("Mock provider: no fixture entry for this question.");
        return { text: JSON.stringify(entry), inputTokens: 0, outputTokens: 0 };
      }
      case "grading": {
        const { pattern } = JSON.parse(await fixture("grading.json")) as {
          pattern: { result: string; student_answer_read: string | null; work_shown: boolean | null; feedback: string | null }[];
        };
        const m = /Questions on this page:\s*(\[[\s\S]*?\])\s*Grade each question/.exec(text);
        const questions = m ? (JSON.parse(m[1]) as { id?: string; correct_answer?: string }[]) : [];
        const results = questions.map((q, i) => {
          const p = pattern[i % pattern.length] ?? { result: "needs_check", student_answer_read: null, work_shown: null, feedback: null };
          return {
            id: q.id,
            ...p,
            student_answer_read: p.student_answer_read === "<correct>" ? (q.correct_answer ?? null) : p.student_answer_read,
          };
        });
        return { text: JSON.stringify({ results }), inputTokens: 0, outputTokens: 0 };
      }
    }
  },
};
