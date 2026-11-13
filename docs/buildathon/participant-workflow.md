# Participant workflow: board → Devin → app

The balanced team: **Miro is where you think, plan, design and decide. Devin is
the AI engineer that builds, tests and ships.**

## 1. Ideate on the Miro board

On your team's board, fill in:

- **Persona** — who the learner is (age, what they like, what they struggle with).
- **Topic** — what they're learning (it does not have to be math).
- **Three changes** — the three things you'd most like this app to do
  differently for them.

## 2. Plan with Devin

Give Devin the repo and your board summary. First prompt to paste:

> I'm building a tutoring app for *[person]* to learn *[topic]*. The repo's
> `starter/` folder is the app; use the `tutor-kit-rules` skill. Here is my
> board summary: *[paste persona, topic, and the three changes]*. Plan the
> personalization — start with `mission.config.ts`, prompts and fixtures — and
> keep the four screens intact.

Read Devin's plan, adjust on the board or in the chat, then let it execute.

## 3. Execute

Devin edits the code. If you're running it yourself:

```bash
cd starter
npm install
cp .env.example .env.local   # AI_PROVIDER=mock works with no keys
npm run dev
```

In a Devin preview, just click through the four screens — **"Use the sample
material"** on screen 2 needs nothing to upload.

## 4. Iterate

Noticed something off? Back to the board: write the change as an action item,
hand it to Devin, re-run. That's the demo we showed — now it's yours.

## 5. Check and record

```bash
npm run check         # the submission checklist
npm run demo:record   # records submission/demo.webm via system Chrome
```

Fix any FAIL lines (the `check-submission` skill explains each one).

## 6. Submit

Push your repo public (or share the fork link) plus the demo video, as
instructed at the event.
