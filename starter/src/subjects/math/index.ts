// Math subject: web's arithmetic/place-value checks and the picture renderer.
import { Picture } from "@/components/pictures/Picture";
import { checkGenerated } from "@/lib/checks";
import type { Subject } from "../types";

export const math: Subject = {
  name: "math",
  checkGenerated,
  Picture: Picture as Subject["Picture"],
  promptHints: ({ topic, level, persona }) => `
Learner and level:
- The learner is ${persona}. Topic: ${topic}. Level: ${level} — beginner: keep numbers small and wording simple; intermediate: match the original; advanced: slightly larger numbers, no extra scaffolding.`,
};
