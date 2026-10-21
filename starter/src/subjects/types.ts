import type { ComponentType } from "react";
import type { Level } from "@mission";
import type { CheckReport, GeneratedQuestion, SourceQuestion } from "@/lib/checks";

/** A subject module: its checker, picture renderer, and prompt hints. */
export interface Subject {
  name: string;
  checkGenerated(original: SourceQuestion, generated: GeneratedQuestion): CheckReport;
  Picture: ComponentType<{ spec: unknown }> | null;
  promptHints(p: { topic: string; level: Level; persona: string }): string;
}

export type { CheckReport, GeneratedQuestion, SourceQuestion };
