# Buildathon challenge: Build Your Balanced Team

**Your sentence:** "I am building a tutoring app for **[person]** to learn **[topic]**."

Fill in the blanks, then fork the `docs/starter/` app ("Learning Mission") into a
working, personalized tutoring tool — with Devin doing the building.

## What you're given

`docs/starter/` is a complete app with four screens: **Get to know me → What I'm
studying → Practice → How did I do**. It runs in a Devin preview with
`AI_PROVIDER=mock` — no API keys needed — and ships with sample material so
you never need a real photo or PDF.

## Requirements

1. Pick a learner and a topic (real or invented — this is your mission).
2. Keep the four screens and the locked core intact (`npm run check` verifies
   it — see the `tutor-kit-rules` skill).
3. Personalize: `mission.config.ts`, the `prompts/*.md` files, the `fixtures/`
   the mock AI answers from, the theme — maybe a new `src/features/` feature.
4. It must run end-to-end (`AI_PROVIDER=mock npm run dev`).
5. `npm run check` passes.
6. Deliver: a public repo (or fork) + a demo video (`npm run demo:record`).

## What good looks like

- **Depth of personalization** — the app should feel built *for* your learner,
  not reskinned. Persona, goal and level should change the practice it writes.
- **Working flow** — every screen runs, start to finish, without errors.
- **Clarity of the demo** — a stranger should get it in 90 seconds.

## Timebox

About 2 hours of build time inside the session. Ideate on the Miro board
first, build with Devin, iterate — the loop is the point of the night.

## Stuck?

Office-hours desk — flag us down. Devin skills in `.devin/skills/`
(`tutor-kit-rules`, `record-demo-video`, `check-submission`) carry the
recipes.
