// The participant-editable prompt files at starter/prompts/. Plain text, read
// at runtime and appended to the core instructions, so a team's wording is
// never buried in code.
import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

export function localPrompt(name: string): string {
  try {
    return readFileSync(path.join(process.cwd(), "prompts", name), "utf8").trim();
  } catch {
    return "";
  }
}
