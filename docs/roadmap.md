# Math Mission Roadmap

**This is the live plan.** Tick boxes here as work gets done. Handoffs are dated snapshots that link here; the backend doc points here instead of keeping its own copy.

**Definition of done:** Math Mission is released online and publicly available (end of Phase 4).

**Last updated:** 2026-10-15

| Phase | What it covers | Status |
|---|---|---|
| [0: Decisions](#phase-0--decisions) | Product and technical decisions | ✅ Done (business model deferred to Phase 4) |
| [1: Foundation](#phase-1--foundation) | Real project setup: repo, app, database, hosting, "Built for change" | ⬜ **Next** |
| [2: Core product](#phase-2--core-product) | The app itself, from upload to celebration | ⬜ |
| [3: Invite-only launch](#phase-3--invite-only-launch-stage-1) | Online for Gabe and a few invited families | ⬜ |
| [4: Public launch](#phase-4--public-launch-stage-2) | Open to everyone: **definition of done** | ⬜ |

The two launch stages come from [decision 001](decisions/001-launch-audience.md): invite-only first, public later.

---

## Phase 0 — Decisions
Recorded in the [decision log](decisions/README.md).

- [x] Launch audience: family first, then public ([001](decisions/001-launch-audience.md))
- [x] AI provider: Google Gemini 3.8 Flash ([002](decisions/002-ai-provider.md))
- [x] Grading: AI grades, tutor overrides; work required only where asked; drawings count ([003](decisions/003-grading-model.md))
- [x] Working name "Math Mission"; final name before public launch ([005](decisions/005-name-and-domain.md))
- [x] Photos deleted at session end (max 30 days); text kept until deleted ([006](decisions/006-upload-retention.md))
- [x] Tech stack: Next.js on Vercel + Supabase ([007](decisions/007-tech-stack.md))
- [x] No grade level; the uploaded test decides ([009](decisions/009-no-grade-level.md))
- [x] One practice question per missed question, new numbers, math-checked ([010](decisions/010-question-generation.md))
- [x] Spec (v1.1) and backend doc updated to match
- [ ] Business model (004): *deferred to Phase 4*

**Done when:** every decision needed to start building is made. ✅ Met 2026-10-15.

---

## Phase 1 — Foundation
Set up the real project so building can start. You create the GitHub, Supabase and Vercel accounts; Claude does the setup.

- [ ] **Accounts:** GitHub, Supabase, Vercel (created by the tutor; step-by-step in the [setup guide](setup-guide.md))
- [ ] **Tools on this Mac:** update Node.js (20.3 → 20.9+), install GitHub CLI; tutor signs in to GitHub, Vercel and Supabase CLIs
- [ ] **Private GitHub repo,** with `test-data/`, `benchmark/.env` and `benchmark/results/` excluded. Decide what to do with the old `github.com/miapen-snail/gabe-math-app` repo
- [ ] **Next.js project** (TypeScript)
- [ ] **Supabase project:** database, logins, private photo storage
- [ ] **Vercel hosting:** staging and production, automatic deploys from GitHub, a preview link for every change
- [ ] **"Built for change" groundwork** before any screens ([007](decisions/007-tech-stack.md#built-for-change)):
  - [ ] Theme file (colors, fonts, effects, app name in one place)
  - [ ] Shared UI building blocks
  - [ ] Prompts folder (move in the `benchmark/prompts/` versions)
  - [ ] Benchmark runs against `test-data/` from inside the project
  - [ ] Database changes as migration files
- [ ] **Database schema** from backend doc §3 as the first migrations
- [ ] **Invite-only login** working
- [ ] **Local preview:** fix `.claude/launch.json` to start the Next.js dev server

**Done when:** an invited user can log in on the staging site, and the benchmark runs from inside the project.

---

## Phase 2 — Core product
Build the app described in the spec (v1.1) and backend doc.

**Upload and reading the test**
- [ ] Upload: photos, PDF or screenshots, multi-page; progress indicator
- [ ] Photo prep: strip metadata (GPS), fix rotation, split PDFs, resize ([006](decisions/006-upload-retention.md))
- [ ] Extraction with Gemini 3.8 Flash: missed questions, partial credit, pictures, "work required" ([002](decisions/002-ai-provider.md))
- [ ] Tutor review: remove, edit or add questions; set "work required"

**Practice set**
- [ ] **Generation test first:** add a generation check to the benchmark (same skill, passes the math check). It's the one AI job not yet tested
- [ ] Generation: one practice question per missed question, same wording and order, new numbers ([010](decisions/010-question-generation.md))
- [ ] Math checker (validation rules); retry, then flag for the tutor
- [ ] Regenerate and Edit buttons on each practice question
- [ ] Printable practice sheet: letter size, space for work, pictures redrawn with the new numbers
- [ ] Answer key with worked steps

**Grading and review session**
- [ ] Upload of the student's work → grading: pass / redo / needs tutor check / skipped ([003](decisions/003-grading-model.md))
- [ ] One-tap override that adjusts stars and progress
- [ ] Review session: question on screen, Show Hint, Redo with re-upload, Got it / Move on, stars, progress dots, pause and resume
- [ ] Bonus Round, with a big celebration on a win
- [ ] Session summary, optional printable certificate, Start New Session

**Around the edges**
- [ ] Daily photo-deletion job; delete-a-session and delete-everything controls ([006](decisions/006-upload-retention.md))
- [ ] Error handling: unreadable photos, AI failures and timeouts, retry without losing work
- [ ] Upload screen tip on good lighting (faint pencil is the main grading weakness)
- [ ] Game UI rebuilt from the Hologram HUD prototype (`index.html`); responsive on phone and tablet

**Done when:** a full real session with Gabe runs end to end on the staging site.

---

## Phase 3 — Invite-only launch (stage 1)
Online at a free Vercel address for Gabe and a few invited families ([001](decisions/001-launch-audience.md), [005](decisions/005-name-and-domain.md)).

- [ ] Production deploy (`*.vercel.app`)
- [ ] AI spending cap set in Google Cloud billing
- [ ] Error tracking
- [ ] Security basics: secrets server-side only, HTTPS, invite-only access checked on every route
- [ ] Confirm Gemini paid-tier data terms (no training on uploads)
- [ ] Real tutoring sessions with Gabe; fix what comes up
- [ ] Invite a few other families/tutors; collect feedback
- [ ] Re-run the benchmark as Gabe's new tests come in

**Done when:** several real sessions have been completed by families other than Gabe's.

---

## Phase 4 — Public launch (stage 2)
Open to everyone. This is the **definition of done**.

**Decisions**
- [ ] Business model: free, free with limits, or paid; who covers AI costs (decision 004)
- [ ] Final name: shortlist → US trademark search (Kahoot! has "Math Missions") → register domain → update the name setting and docs ([005](decisions/005-name-and-domain.md))

**Safety and legal**
- [ ] Legal review: children's privacy (COPPA) and trademark
- [ ] Privacy policy and terms of service
- [ ] Per-user limits on uploads and sessions; abuse and cost controls
- [ ] Confirm Supabase, Vercel and Google terms for children's data and storage region

**For new users**
- [ ] Open sign-up
- [ ] Landing page, how-it-works, demo with a sample worksheet, help/feedback contact
- [ ] Accessibility and cross-browser check (Chrome, Safari, Firefox)
- [ ] Analytics (privacy-respecting)

**Launch**
- [ ] Load and cost check under realistic usage; move to paid hosting plans if needed
- [ ] Production domain, DNS, backups
- [ ] **App publicly available** ✅ definition of done

---

## Open questions (not blocking Phase 1)
- **Bonus Round prize** (spec OQ-6): what should the app show when the student wins? Needed in Phase 2.
- **Offline review** (spec §6.1): the spec asks for offline review sessions, but AI grading needs a connection. Drop the requirement, or keep it for viewing results already graded? Needed in Phase 2.
