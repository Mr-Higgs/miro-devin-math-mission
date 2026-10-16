# 007 — Tech stack and hosting

**Status:** Decided
**Date:** 2026-10-15
**Phase:** 0

## Question
What does Math Mission run on: language, framework, database, file storage, logins and hosting?

## Who builds it
**The tutor/product owner now, working with Claude Code; a technical co-founder may join later.** So the stack must be simple enough to run without a dedicated engineer, and mainstream enough that a developer joining later recognizes it immediately.

## Options considered
1. **Next.js + Supabase + Vercel.** One language (TypeScript) for screens and server; 2 services. *Chosen.*
2. **Python (FastAPI) API + separate frontend,** PostgreSQL, S3/R2, hosted on Render or Railway. Matches the backend doc's sketch; 4–5 services and 2 languages.
3. **Firebase.** All-in-one, but a non-relational database means redesigning the data model, and everything is tied to Google.

## Decision

| Piece | Choice | Covers |
|---|---|---|
| App framework | **Next.js** (TypeScript, React) | Game UI screens and server routes in one project |
| Hosting | **Vercel** | Web address, deploys from GitHub, staging previews, scheduled jobs |
| Database | **Supabase Postgres** | The backend doc's relational data model (§3) mostly carries over |
| Logins | **Supabase Auth** | Invite-only at stage 1, open sign-up at public launch ([001](001-launch-audience.md)) |
| File storage | **Supabase Storage** (private bucket) | Photos with private, expiring links ([006](006-upload-retention.md)) |
| AI | Called only from Next.js server routes | Keys never reach the browser; provider chosen in [002](002-ai-provider.md) |
| Code | **Private** GitHub repo | `test-data/` excluded via `.gitignore` |

## Why
- **Fewest moving parts:** two services, one language. Easiest for one person plus Claude Code to build and keep running.
- **Everything the earlier decisions need is built in:** invite-only logins (001), private storage and a scheduled cleanup job (006), server-side AI calls with keys kept secret.
- **Very widely used.** Claude writes it well, and a future co-founder will know it.
- **Low starting cost:** both have free tiers that should cover the invite-only stage.

## How the decided features map onto it
- **Photo deletion (006):** a daily Vercel scheduled job deletes photos from completed sessions and any older than 30 days.
- **Metadata stripping (006):** done in the upload server route before the photo is stored or sent to the AI.
- **Math checker (010):** TypeScript code in the server, run on every generated question.
- **Game UI:** the Hologram HUD styles and screens from `index.html` are rebuilt as React components. The look carries over; the code is rewritten.

## Built for change
The app should stay easy to restyle and extend after launch. These six practices are set up in Phase 1, before any screens are built:

1. **One theme file.** All colors, fonts, glow effects and spacing live in a single place. Restyling the app (e.g., away from Hologram HUD) means editing that file, not every screen.
2. **Shared building blocks.** Buttons, question cards, the star counter, progress dots and so on are built once and reused across screens, never copied. Changing one changes it everywhere.
3. **AI instructions in one folder.** Every prompt (extraction, grading, generation, hints) lives in its own file in one folder, so they can be found and adjusted without digging through code.
4. **Automatic tests against `test-data/`.** The math checker and AI grading are tested against the real samples. Any change to prompts or the AI provider must pass before it goes live.
5. **Database changes as migration files.** Every change to what the database stores is a file in the repo, applied the same way on staging and production, never by hand.
6. **A preview link for every change.** Vercel builds a private preview of each change. Check it, including on a phone, before it goes live.

**How easy common changes will be:**

| Kind of change | Effort | Why |
|---|---|---|
| Restyle the app or a screen | Easy | Theme file + shared building blocks |
| Add or change a screen | Easy | New screens are new files; building blocks already exist |
| Store a new kind of information | Moderate | Needs a migration file; existing data must keep working |
| Change how the AI behaves | Moderate | Edit the prompt, then re-run the `test-data/` tests to make sure nothing else got worse |
| Move off Supabase or Vercel | Hard | Logins and photo storage would need rebuilding. The database is standard Postgres, so the data itself moves easily |

## Watch-outs (check at setup)
- **Long AI calls.** Reading a multi-page test may take longer than a web request normally allows. Extraction may need to run as a background task, with the screen showing progress. Check Vercel's current function time limits.
- **Free-tier limits.** Vercel's free plan is for personal, non-commercial use, so moving to paid users (decision 004) means a paid plan. Supabase's free tier pauses projects that go unused for a while. Confirm current terms and prices when setting up.
- **Children's data.** Check both services' data-processing terms and storage region before the public launch (Phase 3).

## Affects
- **Backend doc §5 (Tech stack):** filled in by this decision. §7 architecture diagram: replace the separate API server, S3/R2 and GPT-4o boxes with Next.js on Vercel, Supabase and the provider from 002.
- **Phase 1:** set up the GitHub repo, Next.js project, Supabase project and Vercel deploys; put the six "Built for change" practices in place; fix `.claude/launch.json` to start the Next.js dev server.
- **Spec OQ-1 (hosting) and OQ-3 (API keys):** answered. Hosted on Vercel; keys stored server-side.
