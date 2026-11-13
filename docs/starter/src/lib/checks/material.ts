// Checks the AI's reading of the study material (screen 2). Pure functions —
// the app, the mock fixtures and `npm run check` all run the same code.
// No server-only or path aliases: the checker imports this file under tsx.

export interface MaterialDraft {
  title: string;
  summary: string;
  key_ideas: { title: string; explanation: string }[];
}

export function checkMaterial(reply: unknown): { ok: boolean; value: MaterialDraft | null; problems: string[] } {
  const problems: string[] = [];
  const r = reply as Record<string, unknown>;
  if (!r || typeof r !== "object") {
    return { ok: false, value: null, problems: ["The reply isn't a JSON object"] };
  }
  if (typeof r.title !== "string" || !r.title.trim()) problems.push("title is missing or empty");
  if (typeof r.summary !== "string" || !r.summary.trim()) problems.push("summary is missing or empty");

  const ideas = Array.isArray(r.key_ideas) ? r.key_ideas : null;
  if (!ideas) {
    problems.push("key_ideas is missing or not a list");
  } else {
    if (ideas.length < 2 || ideas.length > 8) problems.push(`key_ideas has ${ideas.length} items; it needs 2 to 8`);
    const titles = new Set<string>();
    for (const [i, idea] of ideas.entries()) {
      const k = idea as Record<string, unknown>;
      if (!k || typeof k !== "object" || typeof k.title !== "string" || !k.title.trim()) {
        problems.push(`key_ideas[${i}].title is missing or empty`);
      } else {
        const t = k.title.trim().toLowerCase();
        if (titles.has(t)) problems.push(`key_ideas[${i}].title "${k.title}" is a duplicate`);
        titles.add(t);
      }
      if (!k || typeof k !== "object" || typeof k.explanation !== "string" || !k.explanation.trim()) {
        problems.push(`key_ideas[${i}].explanation is missing or empty`);
      }
    }
  }

  if (problems.length) return { ok: false, value: null, problems };
  return {
    ok: true,
    value: {
      title: (r.title as string).trim(),
      summary: (r.summary as string).trim(),
      key_ideas: ideas!.map((k) => ({
        title: String((k as Record<string, unknown>).title).trim(),
        explanation: String((k as Record<string, unknown>).explanation).trim(),
      })),
    },
    problems: [],
  };
}
