# Gabe's Math Mission

A game-style web app that turns a graded math test into a personalized practice session. The tutor uploads a photo of the test, AI finds the missed questions, the app generates fresh versions with new numbers, prints a worksheet, and runs a gamified review with the student.

Built first for Gabe and Auntie Mia; designed to grow into a tool for any parent, tutor, or after-school volunteer. There's no grade setting: the uploaded test decides the topics.

## Definition of done
The app is released online and publicly available. See the [roadmap](docs/roadmap.md) for the remaining work.

## Status
**Phase 0 (decisions) done; Phase 1 (foundation) next.** Working prototype is the frontend-only `index.html`; AI provider chosen (Gemini 3.8 Flash) and tested on real samples.

- Roadmap (live plan and checklist): [docs/roadmap.md](docs/roadmap.md)
- Decisions: [docs/decisions/](docs/decisions/README.md)
- Latest handoff: [handoffs/2026-10-15-handoff.md](handoffs/2026-10-15-handoff.md)

## What's in this folder

| File | What it is |
|---|---|
| [index.html](index.html) | **Main working prototype** (Hologram HUD theme, bug fixes applied) |
| [Math Mission - Spec.docx](docs/Math%20Mission%20-%20Spec.docx) | Product spec v1.1 (updated Oct 2026 to match the decision log; v1.0 in `docs/archive/`) |
| [Backend_Planning_Doc.md](docs/Backend_Planning_Doc.md) | Backend plan: data model, API, architecture, AI strategy (in progress) |
| [bug-report.md](docs/bug-report.md) | Bug audit of the Hologram prototype (Apr 6) |
| [docs/roadmap.md](docs/roadmap.md) | **The live plan:** phases 0–4 with checklists. Start here to see what's next |
| [docs/setup-guide.md](docs/setup-guide.md) | Step-by-step guide to the accounts needed for Phase 1 (GitHub, Vercel, Supabase) |
| [docs/decisions/](docs/decisions/) | Decision log: one file per product/technical decision, with an index of what's open |
| [benchmark/](benchmark/) | Script that compares AI providers on `test-data/` (decision 002) |
| [test-data/](test-data/) | Real sample photos + hand-checked expected results for testing AI (contains a child's info; keep private) |
| [design-explorations/](design-explorations/) | Earlier design work: 3 wireframes (option 3 chosen) + feedback, and 8 visual themes `v1`–`v5` (v2b Hologram HUD chosen) |
| [serve.py](serve.py) | Tiny local server on port 3456 |
| [handoffs/](handoffs/) | Dated handoff notes, newest = current state |

## Running locally
```bash
python3 serve.py
```
Then open http://127.0.0.1:3456. (Note: `.claude/launch.json` still points to an old folder path — see the latest handoff.)

## Handoffs
At the end of each work session, add a new file to `handoffs/` named `YYYY-MM-DD-handoff.md` covering what changed, decisions made, and next steps. Don't edit old handoffs.

Keep three things current instead: tick boxes in the [roadmap](docs/roadmap.md), the **Status** line above, and the **Latest handoff** link.
