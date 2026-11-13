// Marking the learner's answers (screen 4): one item per question sent for
// marking, plus an overall summary and 1-3 next steps. App-graded results are
// sent as context so the summary sees the whole set.
import { mission } from "@mission";
import { localPrompt } from "./local";

const TONES: Record<string, string> = {
  encouraging: "encouraging — always find the bit that went well first",
  direct: "direct — short, plain, no fluff",
  playful: "playful — light and fun, but still clear about what to fix",
};

export const EVALUATE_INSTRUCTIONS = `You are marking a learner's practice answers for a tutoring app.

Return JSON:

{"items": [{"question_id": string, "result": "right"|"almost"|"not_yet", "feedback": string}], "summary": string, "next_steps": [string]}

Rules:
- One item per question in "Questions to mark", each with its question_id.
- "result": "right" when the answer matches the model answer in spirit; "almost" when it's on the way but misses something; "not_yet" otherwise.
- "feedback": ${TONES[mission.feedback.tone] ?? TONES.encouraging}. Say what was good, then one thing to try. Two or three short sentences, addressed to the learner as "you". Never repeat the learner's name.
- "summary": 1-2 sentences on the whole set, same tone, including how they did overall (the app-graded results are listed for context).
- "next_steps": 1 to 3 short suggestions for what to practice next.
- Return only the JSON object. No markdown, no code fences.

${localPrompt("feedback.md")}`;

export interface ToMarkItem {
  question_id: string;
  type: string;
  key_idea_title: string | null;
  prompt: string;
  model_answer: string;
  learner_answer: string;
}

export interface AlreadyGradedItem {
  id: string;
  result: string;
  learner_answer: string;
}

export function evaluateRequest(opts: { toMark: ToMarkItem[]; alreadyGraded: AlreadyGradedItem[] }): string {
  return [
    `The learner is ${mission.learner.persona || "a learner"}, working on ${mission.topic} at ${mission.level} level.`,
    mission.learner.goal ? `Their goal: ${mission.learner.goal}.` : "",
    "",
    `Questions to mark: ${JSON.stringify(opts.toMark)}`,
    `Already graded by the app (context for the summary): ${JSON.stringify(opts.alreadyGraded)}`,
  ].join("\n");
}
