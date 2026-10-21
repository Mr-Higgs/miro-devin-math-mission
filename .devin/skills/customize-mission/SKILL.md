---
name: customize-mission
description: Personalize the starter tutoring app for a new learner/topic without breaking its core flow.
---

# Customize the mission

The challenge sentence: **"I am building a tutoring app for [person] to learn [topic]."**
Fill in [person] and [topic] from the user's Miro board, then personalize the
`starter/` app in this order — easiest wins first:

1. **`starter/mission.config.ts`** — `appName`, `tagline`, `learner.name`,
   `learner.persona`, `topic`, `level`, `subject` (`math` or `generic`),
   `theme.accent`.
2. **Onboarding copy** — `src/app/onboard/page.tsx` field labels/defaults.
3. **Theme** — `src/theme/theme.css` (colors) and `src/theme/fonts.ts`.
4. **Prompts** — `src/prompts/`: tune `generation.ts` wording and the subject
   `promptHints` first; extraction/grading prompts change less often.
5. **Subject module** — if the topic isn't math: copy `src/subjects/generic/`
   to `src/subjects/<name>/`, implement `checkGenerated`/`Picture`/`promptHints`,
   register it in `src/subjects/index.ts` and in the `subject` union type in
   `mission.config.ts`.
6. **UI copy** — button labels and page intros in `src/app/**`.

## Guardrails — do not change

- The 5-step route structure: `/onboard`, `/sessions/new`,
  `/sessions/[id]/questions`, `/sessions/[id]/practice`, `/sessions/[id]/work`,
  `/sessions/[id]/review` (+ `print/` pages).
- `src/lib/store/` shapes (`Session`, `Question`, `GeneratedQuestionRecord`,
  `Profile`) and its exported functions.
- `AiProvider`/`AskOptions`/`AiReply` in `src/lib/ai/types.ts`.
- The `Subject` interface in `src/subjects/types.ts`.
- `AI_PROVIDER=mock` must keep working: if you change the shape of extracted or
  generated questions, update `starter/fixtures/*.json` to match.
- Never commit `starter/data/` or any API keys.

## Before finishing

```bash
cd starter && npm run lint && npm run build && npm run check -- --quick
```

## Verify in the browser

`AI_PROVIDER=mock npm run dev`, then click through: `/` → `/onboard` →
`/sessions/new` → "Use the sample test" → `/sessions/<id>/questions` →
`/sessions/<id>/practice` → print sheet/answer key → `/sessions/<id>/work` →
`/sessions/<id>/review`. Every step should render with your new name, topic
and colors.
