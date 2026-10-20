# Decision log

One file per decision, numbered in the order they're made: `NNN-short-name.md`. Each records the question, the options, what was chosen, and why. If a decision is later reversed, don't rewrite it: add a new decision that supersedes it and mark the old one **Superseded by NNN**. Smaller refinements go at the bottom of the original file as a dated **Amendment**.

## Phase 0 decisions

| # | Decision | Status | Outcome |
|---|---|---|---|
| [001](001-launch-audience.md) | Launch audience | ✅ Decided | Family first (invite-only), open to the public later |
| [002](002-ai-provider.md) | AI provider and model | ✅ Decided (amended) | Google Gemini 3.8 Flash: found every missed question in 4/4 runs, 88% grading, cheap. Claude and OpenAI not tested (tutor's call) |
| [003](003-grading-model.md) | Grading model | ✅ Decided (amended ×2) | AI grades, tutor can override; work required only where the question asks for it (drawings count); unsure or work/answer conflict → "needs tutor check"; feedback written for the adult |
| 004 | Business model | ⬜ Open | Free / free with limits / paid; who covers AI costs. Likely deferrable to public launch (see 001). Cost data and ideas: [cost-optimization.md](../cost-optimization.md) |
| [005](005-name-and-domain.md) | Name and domain | ✅ Decided (working name) | "Math Mission" for building and stage 1 on a free Vercel address; final name + trademark search + domain before public launch (Kahoot! "Math Missions" overlap) |
| [006](006-upload-retention.md) | Upload retention | ✅ Decided (amended) | Photos deleted at session end (max 30 days); text and results kept until the tutor deletes; GPS stripped, no real names stored |
| [007](007-tech-stack.md) | Tech stack and hosting | ✅ Decided | Next.js (TypeScript) on Vercel + Supabase (database, logins, private photo storage); private GitHub repo |
| [008](008-target-grade-level.md) | Target grade level | ↩️ Superseded by 009 | ~~3rd grade for MVP~~ |
| [009](009-no-grade-level.md) | No grade level | ✅ Decided | The uploaded test decides topics and difficulty; no grade setting |
| [010](010-question-generation.md) | Question generation | ✅ Decided (amended) | One practice question per missed question that mirrors the original; only numbers/diagrams change and the answer must differ; AI writes, app checks |
| [011](011-adult-only-audience.md) | Adult-only audience | ✅ Decided | 18+ adults only; no student accounts; adult-facing screens; printable student rewards; legal review before invite-only launch |

## Phase 2 decisions

| # | Decision | Status | Outcome |
|---|---|---|---|
| [012](012-ungraded-tests.md) | Ungraded tests | ⬜ Open (proposed) | The app reads a test nobody has graded: works out the answers (with math checks), reads the student's answers, decides what was missed. Recommended: detected automatically, no extra step at upload |

Also open from the spec: OQ-1 to OQ-7 (several are covered by 002, 006 and 007 above).

## Template

```markdown
# NNN — Title

**Status:** Open | Decided | Superseded by NNN
**Date:** YYYY-MM-DD
**Phase:** 0

## Question
## Options considered
## Decision
## Why
## What this means
## Affects
```
