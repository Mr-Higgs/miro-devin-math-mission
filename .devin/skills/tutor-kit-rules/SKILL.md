---
name: tutor-kit-rules
description: Personalize the starter tutoring kit for a learner/topic without breaking its core flow.
---

# Tutor kit rules

The challenge sentence: **"I am building a tutoring app for [person] to learn [topic]."**

The app is four screens:

| Screen | Route | What the learner does |
|---|---|---|
| 1 Get to know me | `/onboard` | name, persona, goal, topic, level |
| 2 What I'm studying | `/sessions/new` → `/sessions/[id]/material` | paste text and/or upload photos or a PDF, or use the sample material; the AI picks out key ideas |
| 3 Practice | `/sessions/[id]/practice` | answer AI-written questions in the app |
| 4 How did I do | `/sessions/[id]/results` | right / almost / not yet per answer, a summary, next steps |

## Where to personalize

- `docs/starter/mission.config.ts` — appName, tagline, learner (name/persona/goal),
  topic, level, material kinds + prompt, practice questionTypes + count,
  feedback tone, features, accent color. **Start here.**
- `docs/starter/prompts/teaching-style.md` and `docs/starter/prompts/feedback.md` —
  plain-text files appended to the AI's instructions. Edit at least one (the
  check requires it).
- `docs/starter/fixtures/*.json` and `sample-material.md` — **rewrite them whenever
  the learner, topic or question types change.** Mock mode
  (`AI_PROVIDER=mock`, the default) answers from these files, so demos and
  the video show the team's own content with no API key. `npm run check`
  validates them against the current config.
- `docs/starter/src/features/` — the extension slot for new work. A `Feature` can
  add a component to each practice question and/or the results screen; turn
  it on by id in `mission.features`. `read-aloud.tsx` is the example.
- `docs/starter/src/theme/` and page copy in `docs/starter/src/app/**` — the look and
  the words.

## Guardrails — do not change

Core files are locked by `core.lock.json` — `npm run check` fails if any of
them change, are deleted, **or new files appear in core dirs**:

- `src/lib/store/`, `src/lib/ai/`, `src/lib/checks/`, `src/lib/jobs/`,
  `src/lib/upload/`, `src/prompts/`, `src/app/api/`, `scripts/` (all files)
- `src/features/types.ts`
- Plus the five `data-step` hooks (`save-profile`, `use-sample`,
  `start-practice`, `submit-answers`, `results-summary`) — the check and the
  video script rely on them.

If the check reports a changed core file, restore it (`git checkout <file>`)
or move the new work into `src/features/` / `src/app/`.

If given Miro frame links: read only the frames you were given — don't wander
the whole board.

## Before calling anything done

```bash
cd docs/starter && npm run dev        # click through all 4 screens in the preview
npm run check                    # every line PASS (video may WARN)
npm run demo:record              # records submission/demo.webm
```

Click through in the preview: `/onboard` → home → `/sessions/new` → "Use the
sample material" → key ideas → practice (answer each type) → results. Every
screen should show your learner, topic and colors.
