# Buildathon challenge: Build Your Balanced Team

**Your sentence:** "I am building a tutoring app for **[person]** to learn **[topic]**."

Fill in the blanks, then fork the `starter/` app ("Learning Mission") into a
working, personalized tutoring tool — with Devin doing the building.

## What you're given

`starter/` is a complete app: **Onboard → Upload → Generate practice → Upload work → Review results**
(five steps). It runs locally with `AI_PROVIDER=mock` — no API keys needed — and
ships with a synthetic sample test so you never need a real photo.

## Requirements

1. Pick a learner and a topic (real or invented — this is your mission).
2. Keep the five-step flow and the store/AI/subject contracts intact.
3. Personalize: `mission.config.ts`, theme, prompts, maybe a whole new
   `src/subjects/` module.
4. It must run locally end-to-end (`AI_PROVIDER=mock npm run dev`).
5. `npm run check` passes.
6. Deliver: a public repo (or fork) + a demo video (`npm run demo:record`).

## What good looks like

- **Depth of personalization** — the app should feel built *for* your learner,
  not reskinned. Persona and level should change the practice it writes.
- **Working flow** — every step runs, start to finish, without errors.
- **Clarity of the demo** — a stranger should get it in 90 seconds.

## Timebox

About 2 hours of build time inside the session. Ideate on the Miro board
first, build with Devin, iterate — the loop is the point of the night.

## Stuck?

Office-hours desk — flag us down. Devin skills in `.devin/skills/`
(`customize-mission`, `record-demo-video`, `check-submission`) carry the
recipes.
