// Checks the AI's practice questions (screen 3). Structural only — the app
// can't judge whether an answer is *right*, only that it's well-formed. Pure
// functions; no server-only or path aliases (the checker runs them under tsx).
import type { QuestionType } from "../../../mission.config";

export interface PracticeDraft {
  type: QuestionType;
  key_idea_id: string | null;
  prompt: string;
  choices: Record<string, string> | null;
  answer: string;
  explanation: string;
  hint: string | null;
}

export interface PracticeCheckOptions {
  count: number;
  questionTypes: string[];
  keyIdeaIds: string[];
}

const CHOICE_LETTERS = /^[A-F]$/;

/** One question's problems. A draft with no problems passed. */
function checkOne(raw: unknown, opts: PracticeCheckOptions): { draft: PracticeDraft | null; problems: string[] } {
  const problems: string[] = [];
  const q = raw as Record<string, unknown>;
  if (!q || typeof q !== "object") return { draft: null, problems: ["Not a JSON object"] };

  const type = typeof q.type === "string" ? q.type : "";
  if (!opts.questionTypes.includes(type)) {
    problems.push(`type "${type || "?"}" isn't one of the allowed types (${opts.questionTypes.join(", ")})`);
  }

  const prompt = typeof q.prompt === "string" ? q.prompt.trim() : "";
  if (!prompt) problems.push("prompt is missing or empty");
  if (type === "fill_in" && !prompt.includes("___")) problems.push("fill_in prompt needs a ___ blank");

  const choices =
    q.choices && typeof q.choices === "object" && !Array.isArray(q.choices) ? (q.choices as Record<string, unknown>) : null;
  if (type === "multiple_choice") {
    if (!choices) {
      problems.push("multiple_choice needs choices");
    } else {
      const keys = Object.keys(choices);
      if (keys.length < 2 || keys.length > 6) problems.push(`has ${keys.length} choices; needs 2 to 6`);
      if (keys.some((k) => !CHOICE_LETTERS.test(k))) problems.push("choice letters must be A to F");
      if (Object.values(choices).some((v) => typeof v !== "string" || !(v as string).trim())) {
        problems.push("every choice needs text");
      }
      const texts = Object.values(choices).map((v) => String(v).trim().toLowerCase());
      if (new Set(texts).size !== texts.length) problems.push("two choices are the same");
    }
  } else if (choices && Object.keys(choices).length) {
    problems.push("has choices, but only multiple_choice questions may");
  }

  const answer = typeof q.answer === "string" ? q.answer.trim() : "";
  if (!answer) {
    problems.push("answer is missing or empty");
  } else if (type === "multiple_choice" && choices) {
    if (!Object.keys(choices).includes(answer)) problems.push(`answer "${answer}" isn't one of the choice letters`);
  }

  const explanation = typeof q.explanation === "string" ? q.explanation.trim() : "";
  if (!explanation) problems.push("explanation is missing or empty");

  if (q.key_idea_id !== null && q.key_idea_id !== undefined) {
    if (typeof q.key_idea_id !== "string" || !opts.keyIdeaIds.includes(q.key_idea_id)) {
      problems.push(`key_idea_id "${String(q.key_idea_id)}" isn't one of the material's key idea ids`);
    }
  }

  if (problems.length) return { draft: null, problems };
  return {
    draft: {
      type: type as QuestionType,
      key_idea_id: (q.key_idea_id as string | null) ?? null,
      prompt,
      choices: choices ? Object.fromEntries(Object.entries(choices).map(([k, v]) => [k, String(v).trim()])) : null,
      answer,
      explanation,
      hint: typeof q.hint === "string" && q.hint.trim() ? q.hint.trim() : null,
    },
    problems: [],
  };
}

export function checkPractice(
  reply: unknown,
  opts: PracticeCheckOptions,
): { problems: string[]; questions: { draft: PracticeDraft | null; problems: string[] }[] } {
  const problems: string[] = [];
  const r = reply as Record<string, unknown>;
  const list = r && typeof r === "object" && Array.isArray(r.questions) ? r.questions : null;
  if (!list) {
    return { problems: ["questions is missing or not a list"], questions: [] };
  }
  if (list.length !== opts.count) problems.push(`has ${list.length} questions; expected ${opts.count}`);

  const questions = list.map((q) => checkOne(q, opts));
  const seen = new Set<string>();
  for (const [i, { draft }] of questions.entries()) {
    if (!draft) continue;
    const key = draft.prompt.toLowerCase();
    if (seen.has(key)) problems.push(`questions[${i}] repeats another question's prompt`);
    seen.add(key);
  }
  return { problems, questions };
}
