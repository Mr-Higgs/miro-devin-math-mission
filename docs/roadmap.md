# Math Mission Roadmap

**This is the live plan.** Tick boxes here as work gets done. Where each piece fits in the app (pages, actions, capabilities) is in the [site map](sitemap.md); ideas for lowering per-use cost are in [cost optimization](cost-optimization.md). Handoffs are dated snapshots that link here; the backend doc points here instead of keeping its own copy.

**Definition of done:** Math Mission is released online and publicly available (end of Phase 4).

**Last updated:** 2026-10-19 (Phase 2: Steps 1–3 working: upload, reading the test, practice set, printable sheet and answer key)

| Phase | What it covers | Status |
|---|---|---|
| [0: Decisions](#phase-0--decisions) | Product and technical decisions | ✅ Done (business model deferred to Phase 4) |
| [1: Foundation](#phase-1--foundation) | Real project setup: repo, app, database, hosting, "Built for change" | ✅ Done 2026-10-19 |
| [2: Core product](#phase-2--core-product) | The app itself, from upload to celebration | 🟡 **Next** |
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
- [x] One practice question per missed question that mirrors the original; only numbers/diagrams change, answer must differ ([010](decisions/010-question-generation.md))
- [x] Adult-only audience: 18+ users, no student accounts, adult-facing screens, printable student rewards ([011](decisions/011-adult-only-audience.md))
- [x] Spec (v1.1) and backend doc updated to match
- [ ] Business model (004): *deferred to Phase 4*

**Done when:** every decision needed to start building is made. ✅ Met 2026-10-15.

---

## Phase 1 — Foundation
Set up the real project so building can start. You create the GitHub, Supabase and Vercel accounts; Claude does the setup.

- [x] **Accounts:** GitHub, Supabase, Vercel (created by the tutor; step-by-step in the [setup guide](setup-guide.md))
- [x] **Tools on this Mac:** Node.js 24 (official installer; broken Homebrew Node removed), GitHub CLI installed and signed in as miapen-snail
- [x] **Tutor signed in to the Vercel and Supabase CLIs** (CLI telemetry turned off). Supabase project "Math Mission" (US East / Ohio) is active, on the tutor's credits account
- [x] **Private GitHub repo:** [miapen-snail/math-mission](https://github.com/miapen-snail/math-mission), with `test-data/`, `.env` files and `web/benchmark/results/` excluded. Old `gabe-math-app` made private and archived (it was public with Gabe's name in it)
- [x] **Next.js project** in `web/`: Next.js 16, React 19, TypeScript, Tailwind CSS 4 (telemetry off). Runs locally at http://localhost:3000
- [x] **Supabase project:** database, logins, private photo storage
  - [x] Connected: repo linked to project `mnlhcdxsobppgymkwcqi` (`supabase/` folder; confirmed empty), client code in `web/src/lib/supabase/`, keys in `web/.env.local` and Vercel (Production + Preview). Check: `/api/health` returns `{"supabase":"ok"}`
  - [x] Logins: see the invite-only login item below
  - [x] Private photo storage: `uploads` bucket (private, 20 MB per file, photos/PDF only); each adult can only reach their own folder
- [x] **Vercel hosting:** project `math-mission` (root directory `web`), connected to GitHub so every push deploys automatically; live at https://math-mission-wheat.vercel.app. Each branch/pull request gets its own preview link
- [x] **"Built for change" groundwork** before any screens ([007](decisions/007-tech-stack.md#built-for-change)):
  - [x] Theme in one place: `web/src/theme/` (`theme.css` colors and effects, light and dark; `fonts.ts`; `brand.ts` app name). Tailwind's own colors are switched off, so screens can only use theme colors
  - [x] Shared UI building blocks: `web/src/components/ui/` (button, card, text field, checkbox, message box, badges incl. grading results, progress dots, page frame). All shown at `/blocks` (hidden on the live site)
  - [x] Prompts folder: `web/src/prompts/` (extraction, grading; text unchanged from the benchmarked versions)
  - [x] Benchmark moved to `web/benchmark/`, uses the app's prompts and `web/.env.local`: `npm run bench` in `web/`
  - [x] Database changes as migration files: `npm run db:new / db:status / db:push / db:types` in `web/`; rules in [supabase/README.md](../supabase/README.md)
- [x] **Database schema** from backend doc §3 as the first migrations (`supabase/migrations/`, applied to the live database 2026-10-16):
  - 11 tables (profiles + the 10 from §3.1; validation rules are code, problem-area tags wait for v2), types in `web/src/lib/supabase/database.types.ts`
  - Privacy: row-level security on every table, each adult sees only their own rows, child rows locked to the same adult, nothing reachable before 18+ and terms are confirmed (011), signed-out visitors get nothing. Checked with 24 tests in a throwaway database; Supabase's security advisor reports no issues
- [x] **Invite-only login** working, with **18+ confirmation and terms acceptance** at sign-up ([011](decisions/011-adult-only-audience.md))
  - [x] Built: email sign-in link (`/login`, `/auth/callback`), 18+ and terms screen (`/welcome`), draft terms (`/terms`), sign-out, `proxy.ts` keeps logins fresh. Adults are added with `npm run invite -- email` in `web/` (no public sign-up)
  - [x] `miapenbiz@gmail.com` invited
  - [x] Supabase dashboard: public sign-up off; Site URL and Redirect URLs set
  - [x] Tested on this Mac (sign in, 18+ and terms saved, sign out)
  - [x] Tested on the live site 2026-10-19
- [x] **Local preview:** `.claude/launch.json` updated (entries `web` and `prototype`); dev server also runs with `npm run dev` in `web/`

**Done when:** an invited user can log in on the staging site, and the benchmark runs from inside the project. ✅ Met 2026-10-19.

---

## Phase 2 — Core product
Build the app described in the spec (v1.1) and backend doc.

**Upload and reading the test**
- [x] Upload (`/sessions/new`): photos, PDF or screenshots, multi-page; progress indicator; reminder to **cover the student's name** ([006](decisions/006-upload-retention.md)). Pages go straight from the browser to private storage (Vercel's ~4.5 MB request limit rules out sending photos through the server); the session is saved only once every page has arrived
- [x] Photo prep, **in the browser before upload** (`web/src/lib/upload/prepare.ts`): every page redrawn as a new JPEG, so metadata and GPS never leave the device; EXIF rotation applied; longest side 2400 px; each PDF page becomes an image ([006](decisions/006-upload-retention.md)). PDF upload verified 2026-10-19 (7-page PDF → 7 clean pages). Phone photos 2026-10-19: stored copies have no EXIF/GPS (originals not located to confirm they had GPS). *Pages photographed with the paper turned stay turned: fixed automatically by extraction (below)*
- [x] Extraction with Gemini 3.8 Flash (`web/src/lib/extraction.ts`, runs from Step 2 with a "Reading the test…" screen; up to 4 minutes; one automatic retry on network errors): missed questions, partial credit, pictures, "work required" ([002](decisions/002-ai-provider.md)). **Also reports which way each page is turned, so pages are shown upright automatically, with no rotate buttons for the adult** (tutor's call 2026-10-19)
  - Accuracy work 2026-10-19, after the tutor found misreadings on phone photos: prompt now separates student pencil from teacher pen, decides correct/missed only from teacher marks, and checks against the written total score. Benchmark on samples 001 + 004 (phone photos), Flash, 3 runs each: missed found 73% → 100%, correct/missed calls 80% → 100%, student answers 77% → 100%, pages upright 100%
  - The app cross-checks every reading on Step 2 (`web/src/lib/checks/extraction.ts`): score on the paper vs points as read, missing student answers, answers that contradict correct/missed. Warnings point the adult at what to check
  - First live test 2026-10-20 (tutor's phone photos): all 10 correct/missed calls right, score 55 adds up; only Q10's faint pencil "D" not found (flagged). **Built 2026-10-20: automatic second look** (`web/src/lib/second-look.ts`): when a student answer is missing, only that question's photo is sent again with a focused prompt. Found Q10's "D" 3/3 times at about a tenth of a full reading's cost; full benchmark still 100% with no second looks needed (no extra cost when nothing is missing)
- [ ] **Ungraded tests** ([012](decisions/012-ungraded-tests.md), proposed 2026-10-19): the app works out the answers (math-checked), reads the student's answers, decides what was missed. Waiting on the tutor's choices; benchmark with student-work samples 002/003
- [ ] Tutor review: remove, edit or add questions; set "work required". *Done: one-tap Mark as correct / missed, Edit answers. Still to do: edit question text, remove, add, work required*

**Practice set** (Step 3: ✅ complete 2026-10-20)
- [x] **Generation test first:** `npm run bench -- generation` (13 real missed/redo questions, `test-data/generation/`). First run 2026-10-19 on Gemini 3.8 Flash: 13/13 passed every check, 12/13 with the answer confirmed by math (the 13th is a symmetry drawing); read by hand, all mirror their originals. Prompt then tightened (always give a check; fixed list of picture types) and re-run: same scores, both fixes working
- [x] Generation (`web/src/lib/generation.ts`, Step 3 `/sessions/[id]/practice`): one practice question per missed question, same wording and order, new numbers ([010](decisions/010-question-generation.md)); written 4 at a time with low thinking (fast, cheap); a "Rewrite practice set" warning if Step 2's missed questions change
- [x] Math checker (validation rules, `web/src/lib/checks/`) runs on every practice question; failures are sent back with the problems, up to 3 tries, then flagged "Needs your check" with the reason
- [x] Regenerate on each practice question (~3 s). *Edit by hand deferred: later, if needed*
- [x] **Diagram drawing** (`web/src/components/pictures/Picture.tsx`): the app draws pictures from data (place-value charts, underlined digits, rectangles and polygons with side lengths, letters, base-ten blocks, bundles of 100, symmetry shapes with a dashed line); anything else is shown as a description to sketch. Preview at `/blocks`
- [x] Printable practice sheet (`/sessions/[id]/print/sheet`): letter size, black and white, nickname and date line, circled answer letters, answer lines, work boxes (larger where work is required); "Save as PDF" via the print dialog
- [x] Answer key (`/sessions/[id]/print/answer-key`): the practice sheet filled in, same layout (tutor's request 2026-10-20): right answers marked, worked steps and a hint in each work box

**Grading and review session**
- [ ] Upload of the student's work → grading: pass / redo / needs tutor check / skipped ([003](decisions/003-grading-model.md))
- [ ] One-tap override that adjusts stars and progress
- [ ] Review session (adult-facing): question and the student's work, grading notes for the adult, Show Hint, Redo with re-upload, Got it / Move on, progress dots, pause and resume
- [ ] Bonus Round: one extra mirrored question; a win unlocks the printable reward
- [ ] Session summary for the adult; **printable student rewards** (certificate, star chart, "mission complete" page) instead of on-screen celebrations ([011](decisions/011-adult-only-audience.md)); Start New Session

**Around the edges**
- [ ] Daily photo-deletion job; delete-a-session and delete-everything controls ([006](decisions/006-upload-retention.md))
- [ ] Error handling: unreadable photos, AI failures and timeouts, retry without losing work
- [x] Upload screen tip on good lighting (faint pencil is the main grading weakness)
- [x] UI for adults: **HUD style** chosen by the tutor 2026-10-20 ([011 Amendment 1](decisions/011-adult-only-audience.md)): the Hologram HUD prototype's dark space look, glowing cyan edges and headings, with plain, professional wording and no on-screen celebrations; responsive on phone and tablet. All in `web/src/theme/`

**Done when:** a full real session with Gabe runs end to end on the staging site.

---

## Phase 3 — Invite-only launch (stage 1)
Online at a free Vercel address for Gabe and a few invited families ([001](decisions/001-launch-audience.md), [005](decisions/005-name-and-domain.md)).

- [ ] **Legal review before launch:** Gemini's 18+ / minors terms and COPPA, against the adult-only design ([011](decisions/011-adult-only-audience.md)). If Gemini isn't allowed, benchmark Claude and switch providers
- [ ] **Own email service** (custom SMTP) for sign-in emails. Supabase's built-in email only reaches members of the Supabase team (about 2 emails an hour) and its wording can't be changed. Once set up, switch the Magic Link template to `supabase/templates/magic_link.html` (link + code, works on phones)
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
- [ ] Legal review: trademark, plus a COPPA re-check for open sign-up
- [ ] Privacy policy and terms of service
- [ ] Per-user limits on uploads and sessions; abuse and cost controls
- [ ] Confirm Supabase, Vercel and Google terms for children's data and storage region

**For new users**
- [ ] Open sign-up
- [ ] Landing page, how-it-works, demo with a sample worksheet, help/feedback contact, all **written for adults** (parents, tutors, mentors), never marketed to children
- [ ] Accessibility and cross-browser check (Chrome, Safari, Firefox)
- [ ] Analytics (privacy-respecting)

**Launch**
- [ ] Load and cost check under realistic usage; move to paid hosting plans if needed
- [ ] Production domain, DNS, backups
- [ ] **App publicly available** ✅ definition of done

---

## Open questions (not blocking Phase 1)
- **Bonus Round prize** (spec OQ-6): now a printable reward (011). What should it look like? Needed in Phase 2.
- **Offline review** (spec §6.1): the spec asks for offline review sessions, but AI grading needs a connection. Drop the requirement, or keep it for viewing results already graded? Needed in Phase 2.
