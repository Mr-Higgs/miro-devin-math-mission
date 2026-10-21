export type Level = "beginner" | "intermediate" | "advanced";

export interface MissionConfig {
  appName: string;
  tagline: string;
  learner: { name: string; persona: string }; // who it's for
  topic: string; // what they're learning
  level: Level;
  subject: "math" | "generic"; // which subject module (src/subjects)
  theme: { accent: string; headingFont?: string }; // accent hex; theme.css reads it via CSS var set in layout
}

export const mission: MissionConfig = {
  appName: "Learning Mission",
  tagline:
    "Practice sheets from graded work, for the adults who support a learner.",
  learner: {
    name: "Alex",
    persona: "a 3rd grader who gets discouraged by long worksheets",
  },
  topic: "3rd-grade math",
  level: "beginner",
  subject: "math",
  theme: { accent: "#00d8ff" },
};
