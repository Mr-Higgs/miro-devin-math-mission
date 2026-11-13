# starter — "Learning Mission"

A small tutoring app that becomes yours. It has four screens:

1. **Get to know me** — who the learner is and why they're learning.
2. **What I'm studying** — paste notes or upload photos/a PDF, and the app picks out the key ideas.
3. **Practice** — questions written from those ideas, answered right in the app.
4. **How did I do** — each answer marked, with kind feedback and what to try next.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. No accounts, no keys — the built-in mock AI
(`AI_PROVIDER=mock`, the default) answers from the files in `fixtures/`, so
everything works offline. On the "What I'm studying" screen, click
**"Use the sample material"** to try it with nothing to upload.

## Make it yours

- `mission.config.ts` — the learner, topic, level, question types, colors. Start here.
- `prompts/teaching-style.md` and `prompts/feedback.md` — how the AI writes, in plain words.
- `fixtures/` — what the mock AI answers. Rewrite them for your learner so the demo shows your content.
- `src/features/` — add a feature and switch it on in the config.
- `src/theme/` — the look.

## Check your work

```bash
npm run check        # the submission checklist (pass it before you're done)
npm run demo:record  # records submission/demo.webm of the whole flow
```

Some files are locked ("core" — the check will tell you if one changed).
Add new things in `src/features/` or `src/app/` instead.

## Real AI (optional)

Copy `.env.example` to `.env.local`, set `AI_PROVIDER` to `gemini`,
`anthropic` or `openai`, and add the matching key. The mock works without any.
