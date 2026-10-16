# 005 — Name and domain

**Status:** Decided (working name; final name due before public launch)
**Date:** 2026-10-15
**Phase:** 0

## Question
What is the app called, and what web address does it use?

## What we found (2026-10-15)

**Name.** "Math Mission" sits in a crowded space:
- **Kahoot! "Math Missions"** is an active K–5 math practice product from a large company, with the same audience and purpose. This is the main risk: parents could confuse the two, and Kahoot could object once the app is public.
- **Scholastic "Math Missions"**: older children's math software. Its trademark (Reg. No. 3048329) was cancelled in 2016.
- **Similar names:** "Mission Math" (Smart Adventures; Plugo/PlayShifu), Mathmateer's "math missions."
- No current registration for "Math Mission" itself turned up, but this was a web search, not a trademark search.

**Domains** (checked by domain lookup):

| Domain | Status |
|---|---|
| mathmission.com | Taken (since 2014; held by a registrar that often resells domains) |
| mathmission.org, mathmission.io | Appeared available |
| getmathmission.com, mathmissionapp.com, trymathmission.com | Appeared available |
| mathmission.app | Couldn't confirm |

## Options considered
1. **Working name now, final name later.** *Chosen.*
2. Keep "Math Mission" permanently and register a domain now.
3. Choose a new, more distinctive name now.

## Decision
- **"Math Mission" is the working name** for building and the invite-only stage (stage 1, [001](001-launch-audience.md)). All docs use it, including the spec (renamed from "Math Tutor App").
- **Stage 1 uses Vercel's free web address** (e.g., `math-mission.vercel.app`). No domain purchase yet.
- **The final name and domain are chosen before the public launch (stage 2)**, after a proper US trademark (USPTO) search, ideally with a lawyer's help alongside the COPPA review.

## Why
- The name only matters to strangers, and strangers arrive at stage 2. Choosing now would mean guessing without knowing how the product will be positioned.
- The Kahoot! overlap is a real risk for a public product, so the final choice deserves a proper check, not a quick web search.
- Renaming later is cheap: the app's name is a single setting in the theme file ([007 "Built for change"](007-tech-stack.md#built-for-change)).

## What this means
- The app's display name lives in one place in the code, never typed into screens directly.
- Before stage 2: shortlist names → USPTO search → check domains → register domain → update the name setting and docs.
- If "Math Mission" survives the trademark check, `.org`, `.io` or a prefixed `.com` are fallback domains (recheck availability then).

## Affects
- **Spec:** retitled "Math Mission" (v1.1).
- **Handoff / roadmap:** final name, trademark search and domain move into the stage 2 (public launch) checklist.
- **Decision 004 (business model):** a paid product raises the stakes of the trademark check.
