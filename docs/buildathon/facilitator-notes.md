# Facilitator notes — Miro x Devin Buildathon

## Before the event

- [ ] Repo is **public**: `miapen-snail/math-mission` (history contains personal
      refs — accepted; the tree is scrubbed).
- [ ] Luma page live: https://luma.com/os4376pi (or set `NEXT_PUBLIC_LUMA_URL`
      in `site/`).
- [ ] Devin credit link ready at the door (devinmiami.com, $200 credit).
- [ ] One Miro board template per team, plus the example board for the opening
      demo.
- [ ] Starter app verified on a fresh clone: `cd starter && npm i && npm run dev`
      with `AI_PROVIDER=mock` → full flow via "Use the sample material".
- [ ] Landing page (`site/`) deploy or local link for the room screen.

## Timeline (from the landing page)

| Time | Beat |
|---|---|
| 6:00 | Doors, food, welcome |
| 6:20 | Host intros; what "Miro x Devin" means |
| 6:35 | "You vote, Devin builds" — room votes on a change to the sample app |
| 6:50 | Live demo: feedback → shipped, feasibility check, architecture on the board |
| 7:40 | Hands-on build with office hours (~1.5 h) |
| 9:15 | Show-and-tell: reveal the opening build; attendee shares |
| 9:45 | Closing |

## Common failure modes

- **Node version** — require Node ≥ 20 (`node -v`). Have installers/USB ready.
- **Port in use** — `npm run dev` picks the next free port automatically; tell
  them to watch the console line, or `PORT=3100 npm run dev`.
- **No Playwright for the demo video** — `npm i -D playwright`; the record
  script uses system Chrome (`channel: "chrome"`), no browser download needed.
- **No API keys / flaky wifi** — `AI_PROVIDER=mock` runs the entire flow;
  fixtures live in `starter/fixtures/`.
- **`npm run check` fails** — walk them through the FAIL lines; usually an
  unedited `mission.config.ts`, README or `prompts/` file, or a touched core
  file (the FAIL lists them; restore with `git checkout <file>`).
