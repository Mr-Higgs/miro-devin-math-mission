// Checks the AI's marking (screen 4). One item per question sent for AI
// marking, plus an overall summary and 1–3 next steps. Pure functions; no
// server-only or path aliases (the checker runs them under tsx).

export const RESULT_KINDS = ["right", "almost", "not_yet"] as const;
export type AiResultKind = (typeof RESULT_KINDS)[number];

export interface EvaluationDraft {
  items: { question_id: string; result: AiResultKind; feedback: string }[];
  summary: string;
  next_steps: string[];
}

export function checkEvaluation(
  reply: unknown,
  ids: string[],
): { ok: boolean; value: EvaluationDraft | null; problems: string[] } {
  const problems: string[] = [];
  const r = reply as Record<string, unknown>;
  if (!r || typeof r !== "object") return { ok: false, value: null, problems: ["The reply isn't a JSON object"] };

  const list = Array.isArray(r.items) ? r.items : null;
  if (!list) {
    problems.push("items is missing or not a list");
  } else {
    const seen = new Set<string>();
    for (const [i, raw] of list.entries()) {
      const item = raw as Record<string, unknown>;
      const id = item && typeof item === "object" ? item.question_id : null;
      if (typeof id !== "string" || !ids.includes(id)) {
        problems.push(`items[${i}].question_id isn't one of the questions sent for marking`);
      } else if (seen.has(id)) {
        problems.push(`items[${i}] repeats question ${id}`);
      }
      if (typeof id === "string") seen.add(id);
      const result = item && typeof item === "object" ? item.result : null;
      if (typeof result !== "string" || !(RESULT_KINDS as readonly string[]).includes(result)) {
        problems.push(`items[${i}].result must be one of ${RESULT_KINDS.join(", ")}`);
      }
      if (!item || typeof item !== "object" || typeof item.feedback !== "string" || !item.feedback.trim()) {
        problems.push(`items[${i}].feedback is missing or empty`);
      }
    }
    for (const id of ids) if (!seen.has(id)) problems.push(`no item for question ${id}`);
  }

  if (typeof r.summary !== "string" || !r.summary.trim()) problems.push("summary is missing or empty");
  const steps = Array.isArray(r.next_steps) ? r.next_steps : null;
  if (!steps) {
    problems.push("next_steps is missing or not a list");
  } else {
    if (steps.length < 1 || steps.length > 3) problems.push(`next_steps has ${steps.length} items; it needs 1 to 3`);
    if (steps.some((s) => typeof s !== "string" || !(s as string).trim())) problems.push("every next step needs text");
  }

  if (problems.length) return { ok: false, value: null, problems };
  return {
    ok: true,
    value: {
      items: list!.map((raw) => {
        const item = raw as Record<string, unknown>;
        return {
          question_id: item.question_id as string,
          result: item.result as AiResultKind,
          feedback: (item.feedback as string).trim(),
        };
      }),
      summary: (r.summary as string).trim(),
      next_steps: steps!.map((s) => String(s).trim()),
    },
    problems: [],
  };
}
