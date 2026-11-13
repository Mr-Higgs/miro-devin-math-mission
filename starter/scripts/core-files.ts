// The shared definition of "core": files a participant shouldn't change, so
// `npm run core:lock` (hosts) and `npm run check` (participants) agree.
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const CORE_DIRS = [
  "src/lib/store",
  "src/lib/ai",
  "src/lib/checks",
  "src/lib/jobs",
  "src/lib/upload",
  "src/prompts",
  "src/app/api",
  "scripts",
];

const CORE_FILES = ["src/features/types.ts"];

export function coreFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (rel: string) => {
    for (const entry of readdirSync(path.join(root, rel), { withFileTypes: true })) {
      const p = path.join(rel, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile()) out.push(p);
    }
  };
  for (const dir of CORE_DIRS) {
    if (statSync(path.join(root, dir), { throwIfNoEntry: false })?.isDirectory()) walk(dir);
  }
  out.push(...CORE_FILES.filter((f) => statSync(path.join(root, f), { throwIfNoEntry: false })?.isFile()));
  return out.sort();
}

/** Participant-editable prompt templates (starter/prompts/*.md), hashed separately. */
export const TEMPLATE_FILES = ["prompts/teaching-style.md", "prompts/feedback.md"];
