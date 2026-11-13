<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Kit rules

This is a participant kit, not a finished app — the buildathon check
(`npm run check`) enforces it. Before changing anything, read
`.devin/skills/tutor-kit-rules/SKILL.md` at the repo root. In short:

- **Four screens**: `/onboard` → `/sessions/new` → `/sessions/[id]/material` →
  `/sessions/[id]/practice` → `/sessions/[id]/results`. Keep them.
- **Personalize in the open places**: `mission.config.ts`, `prompts/*.md`,
  `fixtures/`, `src/features/`, `src/theme/`, copy in `src/app/**`.
- **Core is locked**: everything under `src/lib/store/`, `src/lib/ai/`,
  `src/lib/checks/`, `src/lib/jobs/`, `src/lib/upload/`, `src/prompts/`,
  `src/app/api/`, `scripts/`, plus `src/features/types.ts` — changing,
  deleting or adding files there fails the check. New work goes in
  `src/features/` or `src/app/`.
- **Keep the `data-step` hooks** (`save-profile`, `use-sample`,
  `start-practice`, `submit-answers`, `results-summary`) on their controls —
  the check and `npm run demo:record` drive the app through them.
- **Rewrite `fixtures/`** whenever the learner, topic or question types
  change, and never send the learner's name to the AI.
- Finish with `npm run check` and a click through the four screens.
