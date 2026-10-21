# 001 — Launch audience

**Status:** Decided
**Date:** 2026-10-11
**Phase:** 0

## Question
Who is the public launch for? This sets how much Phase 3 (public readiness) work has to be done before the app first goes online.

## Options considered
1. **Any parent/tutor from day one.** Open sign-up at launch. Requires accounts, privacy policy, cost limits, and polished onboarding before anything goes live.
2. **Family first, open later.** The app is online at a real URL, but access starts invite-only (the student's sessions plus a small trusted group). Open to everyone once it's proven.
3. **Undecided.** Defer.

## Decision
**Option 2 — Family first, open later.**

## Why
- Gets the app into real tutoring sessions with the student sooner, so the core flow (extraction accuracy, worksheet, review) gets tested on real tests before strangers see it.
- Lets the hardest public-readiness work (open sign-up, polished onboarding, scale) wait until the product is worth opening up.
- Keeps AI costs predictable while usage is small and known.

## What this means

The rollout happens in two stages. **The definition of done (publicly available) is met at stage 2, not stage 1.**

| Stage | Who can use it | Must be in place |
|---|---|---|
| **1. Invite-only launch** | the student + a handful of invited families/tutors | Hosted at a real URL; access gate (invite list or invite codes); AI keys server-side; AI spending cap; uploads limited to the minimum needed with a retention/deletion policy; basic error tracking |
| **2. Public launch** | Anyone | Open sign-up with accounts; privacy policy and terms (with legal review for children's privacy/COPPA); per-user rate limits and quotas; landing page, onboarding and demo; analytics; accessibility and cross-browser check |

Children's privacy still matters at stage 1: invited families' kids are real children, so data minimization and the retention policy can't wait for stage 2.

## Affects
- Handoff Phase 3 checklist: split into stage 1 and stage 2 items when the roadmap (backend doc §10) is written.
- Backend doc §2 (MVP scope): replace "single user, static API key" with "invite-only, small group."
- Decision 004 (business model): can likely be deferred until stage 2.
