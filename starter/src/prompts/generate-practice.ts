// Writing the practice set (screen 3): practice.count questions from the
// material's key ideas, at the learner's level, using only the allowed types.
import { mission } from "@mission";
import type { KeyIdea } from "@/lib/store";
import { localPrompt } from "./local";

const LEVEL_GUIDANCE: Record<string, string> = {
  beginner:
    "beginner (remember and recognize): definitions, one-step questions, mostly multiple choice",
  intermediate:
    "intermediate (apply and explain): multi-step questions, and ask \"why\"",
  advanced:
    "advanced (think it through): scenarios, comparing approaches, justify the answer",
};

export const generatePracticeInstructions = () => `You are writing practice questions for a tutoring app.

Return JSON:

{"questions": [{"type": string, "key_idea_id": string|null, "prompt": string, "choices": {"A": string, ...}|null, "answer": string, "explanation": string, "hint": string|null}]}

Rules for every question:
- "type": one of the allowed types in the request. Nothing else.
- "key_idea_id": the id of the key idea it practices, or null.
- "prompt": the question, in plain words, one idea at a time.
- "choices": only for multiple_choice — 3 or 4 options with letters "A", "B", ... For every other type, null.
- "answer": for multiple_choice, the letter of the right choice. For fill_in, the missing word or number (the prompt must show the blank as ___). For flashcard, the back of the card (the prompt is the front). For short_answer and scenario, a short model answer.
- "explanation": why the answer is right, in one or two plain sentences.
- "hint": a small nudge that doesn't give the answer away, or null.
- Level: ${LEVEL_GUIDANCE[mission.level] ?? mission.level}.
- No two questions may ask the same thing.
- Return only the JSON object. No markdown, no code fences.

${localPrompt("teaching-style.md")}`;

export function generatePracticeRequest(opts: { title: string; summary: string | null; keyIdeas: KeyIdea[] }): string {
  return [
    `The learner is ${mission.learner.persona || "a learner"}, working on ${mission.topic} at ${mission.level} level.`,
    mission.learner.goal ? `Their goal: ${mission.learner.goal}.` : "",
    "",
    `Material: "${opts.title}"${opts.summary ? ` — ${opts.summary}` : ""}`,
    `Key ideas: ${JSON.stringify(opts.keyIdeas.map((k) => ({ id: k.id, title: k.title, explanation: k.explanation })))}`,
    `Write exactly ${mission.practice.count} questions using only these types: ${mission.practice.questionTypes.join(", ")}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
