---
name: record-demo-video
description: Record the standardized 60–90 s walkthrough video for the buildathon submission.
---

# Record the demo video

## Prerequisites

- The app running: `cd starter && npm run dev` (default port 3000;
  `AI_PROVIDER=mock` is fine and recommended — it's deterministic).
- Playwright installed: `npm i -D playwright`. The script uses the system
  Chrome via `channel: "chrome"`, so **no `npx playwright install` is needed**.

## What the video must show

The full flow, in order:

1. `/onboard` — the personalized learner, topic and level.
2. `/sessions/new` → **"Use the sample test"**.
3. `/sessions/<id>/questions` — missed questions, score, warnings.
4. `/sessions/<id>/practice` — generated questions with check badges.
5. `/sessions/<id>/print/sheet` — the printable worksheet.
6. `/sessions/<id>/work` → **"Use a sample of finished work"**.
7. `/sessions/<id>/review` — grades, feedback, one-tap overrides.

## How to record

```bash
cd starter
npm run demo:record            # or DEMO_URL=http://localhost:PORT npm run demo:record
```

This runs `scripts/record-demo.mjs`, which drives system Chrome with
Playwright's `recordVideo` and writes **`starter/submission/demo.webm`**.

Optional: if `ffmpeg` is installed, convert to mp4 for wider playback:

```bash
ffmpeg -i starter/submission/demo.webm starter/submission/demo.mp4
```

Keep the video under ~90 seconds — trim pauses rather than rushing the flow.

## Attach it

- The video lives at `starter/submission/demo.*` (gitignored — submit it with
  the repo link as instructed at the event).
- `npm run check` warns if no demo file is present.
