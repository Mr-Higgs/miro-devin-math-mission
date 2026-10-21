# starter — "Learning Mission"

A tutoring app you personalize: upload a photo of graded work, the AI finds the missed questions, and it writes a checked practice sheet you can print. Four steps: **Onboard → Upload → Generate practice → Print**.

## Quickstart

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000, fill in onboarding, then "Start a new session" → **"Use the sample test"** — the bundled fixture and the mock AI provider mean the whole flow works with no API keys and no photo.

## Make it yours

- `mission.config.ts` — app name, learner, topic, level, subject, accent color.
- `src/subjects/` — checks + picture rendering per subject (`math`, `generic`; add your own).
- `src/prompts/` — the extraction / generation / grading prompts.
- `src/theme/` — the look (theme.css, fonts, brand).

## Don't change

- The four-step flow, the store contract in `src/lib/store/`, and the `AiProvider` interface in `src/lib/ai/types.ts` — the submission checker relies on them.

## Env vars

See `.env.example`: `AI_PROVIDER` (`mock` default; `gemini`, `anthropic`, `openai`), the matching API key, `AI_MODEL` override, and `DATA_DIR`.
