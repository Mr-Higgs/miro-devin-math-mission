---
name: record-demo-video
description: Record the standardized 60–90 s walkthrough video for the buildathon submission.
---

# Record the demo video

## Prerequisites

- The app running: `cd starter && npm run dev` (default port 3000;
  `AI_PROVIDER=mock` is fine and recommended — it's deterministic). Pass
  `DEMO_URL` if it picked another port.
- Playwright installed: `npm i -D playwright`. The script uses system Chrome
  (`channel: "chrome"`) first and falls back to the bundled Chromium — if
  neither exists it will say to run `npx playwright install chromium`.

## What the video shows

The four screens, in order, driven by the app's `data-step` hooks:

1. `/onboard` — Get to know me: the personalized learner, goal, topic, level.
2. `/sessions/new` → **"Use the sample material"** → key ideas on the
   material page.
3. `/sessions/<id>/practice` — it answers each question by type (multiple
   choice: first option; text types: a best try; flashcard: show answer,
   "I knew it").
4. `/sessions/<id>/results` — the summary, per-answer badges and next steps.

## How to record

```bash
cd starter
npm run demo:record            # or DEMO_URL=http://localhost:PORT npm run demo:record
```

This runs `scripts/record-demo.mjs`, which drives Chrome with Playwright's
`recordVideo` and writes **`starter/submission/demo.webm`** plus four
screenshots under `starter/screenshots/` (`step-1` … `step-4`).

Optional: if `ffmpeg` is installed, convert to mp4 for wider playback:

```bash
ffmpeg -i starter/submission/demo.webm starter/submission/demo.mp4
```

Keep the video under ~90 seconds.

## Attach it

- The video lives at `starter/submission/demo.*` (gitignored — submit it with
  the repo link as instructed at the event).
- `npm run check` warns if no demo file is present.
