// Reading the study material (screen 2): a title, a short summary, and 2–8
// key ideas. The learner's name is never sent — only persona, goal and topic.
import { mission } from "@mission";
import { localPrompt } from "./local";

export const readMaterialInstructions = () => `You are preparing study material for a tutoring app.

Read the material given (pasted text and/or page images) and return JSON:

{"title": string, "summary": string, "key_ideas": [{"title": string, "explanation": string}]}

Rules:
- "title": a short name for the material, in a few words.
- "summary": 2-4 plain sentences about what the material covers.
- "key_ideas": the 2 to 8 things a learner must understand from this material.
  Each has a short "title" and a one- or two-sentence "explanation" in plain words.
- Write for the learner described below, at their level.
- Return only the JSON object. No markdown, no code fences.

${localPrompt("teaching-style.md")}`;

export function readMaterialRequest(opts: { hasText: boolean; pageCount: number }): string {
  return [
    `The learner is ${mission.learner.persona || "a learner"}, working on ${mission.topic} at ${mission.level} level.`,
    mission.learner.goal ? `Their goal: ${mission.learner.goal}.` : "",
    "",
    opts.hasText ? "The material is below" + (opts.pageCount ? ", followed by page images." : ".") : "The material is the page images attached.",
  ]
    .filter(Boolean)
    .join("\n");
}
