# Math Mission

## Miro x Devin Buildathon — start here

This repo hosts the December 7, 2026 "Build Your Balanced Team" event in Miami.

| Folder | What it is |
|---|---|
| [site/](site/) | Event landing page (`cd site && npm run dev`) |
| [starter/](starter/) | **The participant app** — a tutoring app you personalize with Devin |
| [web/](web/) | The original product (Mia's Supabase-backed app — not part of the buildathon) |
| [.devin/skills/](.devin/skills/) | Devin skills: `customize-mission`, `record-demo-video`, `check-submission` |
| [docs/buildathon/](docs/buildathon/) | Challenge brief, participant workflow, facilitator notes |

**Participant quickstart:**

```bash
cd starter
npm install
cp .env.example .env.local
npm run dev        # AI_PROVIDER=mock — no keys needed
```

Then open http://localhost:3000 and click "Use the sample test". See
[docs/buildathon/challenge-brief.md](docs/buildathon/challenge-brief.md).

## The original app (web/)

A web app for **adults (18+) supporting a student's math**: parents, tutors, mentors. The adult uploads a photo of a graded test, AI finds the missed questions, and the app creates a practice sheet that mirrors them with new numbers or diagrams. It then grades the student's finished sheet from a photo and prints rewards for the student. Students never use the app themselves ([decision 011](docs/decisions/011-adult-only-audience.md)).

Built first for one family; designed to grow into a tool for any parent, tutor, or after-school volunteer. There's no grade setting: the uploaded test decides the topics.

## Definition of done
The app is released online and publicly available. See the [roadmap](docs/roadmap.md) for the remaining work.

## Status
**Phase 1 (foundation) done** (2026-10-19): an invited adult can sign in on the live site, with the 18+ and terms confirmation. Database, private photo storage, hosting and the "Built for change" groundwork are in place. **Next: Phase 2**, starting with the generation benchmark check. The April prototype `index.html` is the visual reference. AI provider: Gemini 3.8 Flash, with an adult-only design (decision 011).

- Roadmap (live plan and checklist): [docs/roadmap.md](docs/roadmap.md)
- Site map (pages, user actions, capabilities; check before building): [docs/sitemap.md](docs/sitemap.md)
- Cost optimization ideas (grow and act on as we go): [docs/cost-optimization.md](docs/cost-optimization.md)
- Decisions: [docs/decisions/](docs/decisions/README.md)
- Latest handoff: [handoffs/2026-10-19-handoff.md](handoffs/2026-10-19-handoff.md)

## What's in this folder

| File | What it is |
|---|---|
| [index.html](index.html) | **Main working prototype** (Hologram HUD theme, bug fixes applied) |
| [Math Mission - Spec.docx](docs/Math%20Mission%20-%20Spec.docx) | Product spec v1.1 (updated Oct 2026 to match the decision log; v1.0 in `docs/archive/`) |
| [Backend_Planning_Doc.md](docs/Backend_Planning_Doc.md) | Backend plan: data model, API, architecture, AI strategy (in progress) |
| [bug-report.md](docs/bug-report.md) | Bug audit of the Hologram prototype (Apr 6) |
| [docs/roadmap.md](docs/roadmap.md) | **The live plan:** phases 0–4 with checklists. Start here to see what's next |
| [docs/sitemap.md](docs/sitemap.md) | **The site map:** every page, what the adult does there, and the capabilities behind it. Check before building; propose changes here |
| [docs/cost-optimization.md](docs/cost-optimization.md) | **Cost ideas:** where the per-use cost goes and ideas to lower it, with status and measured savings. Feeds decision 004 (business model) |
| [docs/setup-guide.md](docs/setup-guide.md) | Step-by-step guide to the accounts needed for Phase 1 (GitHub, Vercel, Supabase) |
| [docs/decisions/](docs/decisions/) | Decision log: one file per product/technical decision, with an index of what's open |
| [web/benchmark/](web/benchmark/README.md) | Benchmark: tests the app's prompts and AI models on `test-data/` (`npm run bench` in `web/`) |
| [test-data/](test-data/) | Real sample photos + hand-checked expected results for testing AI (contains a child's info; keep private) |
| [design-explorations/](design-explorations/) | Earlier design work: 3 wireframes (option 3 chosen) + feedback, and 8 visual themes `v1`–`v5` (v2b Hologram HUD chosen); `print-reference/` holds the hand-made Topic 13 sheet and key, the model for printables |
| [serve.py](serve.py) | Tiny local server on port 3456 |
| [handoffs/](handoffs/) | Dated handoff notes, newest = current state |

## Running locally
The app (Next.js), at http://localhost:3000:
```bash
cd web && npm run dev
```
The April prototype, at http://127.0.0.1:3456:
```bash
python3 serve.py
```

## Privacy
This repository contains no student data. Test-data photos and benchmark results are never committed; `test-data/` and `web/benchmark/` outputs stay local and private.

## Handoffs
At the end of each work session, add a new file to `handoffs/` named `YYYY-MM-DD-handoff.md` covering what changed, decisions made, and next steps. Don't edit old handoffs.

Keep three things current instead: tick boxes in the [roadmap](docs/roadmap.md), the **Status** line above, and the **Latest handoff** link.
