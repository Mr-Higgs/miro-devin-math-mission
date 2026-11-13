// Your mission, in one file. This is the first place to personalize: who the
// app is for, what they're learning, what the practice looks like, and which
// features (src/features/) are turned on. Nothing here needs a restart beyond
// the usual dev-server reload.

export type Level = "beginner" | "intermediate" | "advanced";
export type QuestionType = "multiple_choice" | "fill_in" | "short_answer" | "scenario" | "flashcard";
export type MaterialKind = "text" | "photo" | "pdf";
export type FeedbackTone = "encouraging" | "direct" | "playful";

export interface MissionConfig {
  appName: string;
  tagline: string;
  learner: { name: string; persona: string; goal: string }; // screen 1
  topic: string;
  level: Level; // screen 1
  material: { kinds: MaterialKind[]; prompt: string; examples: string }; // screen 2
  practice: { questionTypes: QuestionType[]; count: number }; // screen 3
  feedback: { tone: FeedbackTone }; // screen 4
  features: string[]; // ids from src/features
  theme: { accent: string; headingFont?: string };
}

export const mission: MissionConfig = {
  appName: "Learning Mission",
  tagline: "Practice built around one learner, from what they're studying.",
  learner: {
    name: "Alex",
    persona: "a 3rd grader who gets discouraged by long worksheets",
    goal: "feel confident on next week's quiz",
  },
  topic: "place value",
  level: "beginner",
  material: {
    kinds: ["text", "photo", "pdf"],
    prompt: "What is Alex studying?",
    examples: "e.g. class notes, a textbook page, or a photo of a worksheet about place value",
  },
  practice: {
    questionTypes: ["multiple_choice", "fill_in", "short_answer"],
    count: 5,
  },
  feedback: { tone: "encouraging" },
  features: ["read-aloud"],
  theme: { accent: "#00d8ff" },
};
